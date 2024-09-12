package main

import (
	"io/fs"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"github.com/gin-gonic/gin"

	"github.com/patrickmn/go-cache"

	"context"
	"embed"
	"html/template"
	"log"
	"net/http"
	"time"
)

var (
	//go:embed static/*
	staticDir embed.FS
	//go:embed templates/*
	templatesDir embed.FS
)

var (
	Cache        = cache.New(2*time.Hour, 6*time.Hour) // Cache expiration and cleanup interval
	IsRefreshing = false
)

func main() {
	ctx := context.Background()

	conf := &firebase.Config{ProjectID: "bitconf-bitconf"}
	app, err := firebase.NewApp(ctx, conf)
	if err != nil {
		log.Fatalf("Failed to create Firebase App: %v", err)
	}
	// Firestore client
	firestore, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalf("Failed to create Firestore client: %v", err)
	}
	defer firestore.Close()

	// Preload the cache with initial data
	err = preloadConferences(ctx, firestore)
	if err != nil {
		log.Fatalf("Failed to preload conferences cache: %v", err)
	}

	staticSubFS, err := fs.Sub(staticDir, "static")
	if err != nil {
		log.Fatalf("Failed to create staticSubFS: %v", err)
	}

	// SERVER

	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	router.StaticFS("/static", http.FS(staticSubFS))
	// Cache templates at server startup
	tmpl := template.Must(template.ParseFS(templatesDir, "templates/*.html"))
	router.SetHTMLTemplate(tmpl)

	router.GET("/", func(c *gin.Context) {
		homeHandler(c, firestore)
	})

	router.GET("/submit", func(c *gin.Context) {
		c.Redirect(http.StatusPermanentRedirect, "https://forms.gle/HpCJmAjSQVnU2p1M6")
	})

	router.Run(":8080")
}

func preloadConferences(ctx context.Context, firestore *firestore.Client) error {
	conferences, err := FetchConferences(ctx, firestore)
	if err != nil {
		return err
	}
	// Set fetched conferences in cache
	Cache.Set("conferences", conferences, cache.DefaultExpiration)
	return nil
}

func homeHandler(c *gin.Context, firestore *firestore.Client) {
	// Check for cached conferences
	cachedConferences, expTime, found := Cache.GetWithExpiration("conferences")
	if found {
		log.Printf("==> cache is found, expires at %v", expTime.Format("01-02 15:04:05"))
		// Serve stale data
		renderHome(c, cachedConferences.([]Conference))

		// Check if the cache needs to be refreshed asynchronously
		if expTime.Sub(time.Now()) < 15*time.Minute && !IsRefreshing {
			go RefreshConferences(c, firestore)
		}
		return
	}

	log.Println("==> no cache, fetch data sync")

	// If no cache found, fetch data synchronously
	conferences, err := FetchConferences(c, firestore)
	if err != nil {
		c.Error(err) // Optional: logs the error to Gin's error logger

		// Return a 500 Internal Server Error with a JSON response
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Internal Server Error",
			"message": err.Error(),
		})
		return
	}

	Cache.Set("conferences", conferences, cache.DefaultExpiration)

	renderHome(c, conferences)
}

func renderHome(c *gin.Context, conferences []Conference) {
	c.HTML(http.StatusOK, "home.html", gin.H{
		"conferences": conferences,
		"toast": gin.H{
			"toast":   c.Query("toast"), // "success" or any other for error
			"message": c.Query("message"),
		},
	})
}
