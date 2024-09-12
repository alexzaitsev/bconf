package main

import (
	"context"
	"log"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"github.com/patrickmn/go-cache"
	"google.golang.org/api/iterator"
)

func RefreshConferences(c *gin.Context, firestore *firestore.Client) {
	IsRefreshing = true
	defer func() {
		IsRefreshing = false
	}()

	log.Println("==> starting refreshing conferences")

	// Create a context with a timeout of 2 minutes
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	done := make(chan struct{}) // Channel to signal when the goroutine completes

	go func() {
		defer close(done) // Close the channel when the goroutine completes

		log.Println("==> starting goroutine")

		time.Sleep(1 * time.Minute)

		conferences, err := FetchConferences(c, firestore)
		if err == nil {
			Cache.Set("conferences", conferences, cache.DefaultExpiration)
		} else {
			c.Error(err)
		}
		log.Println("==> goroutine ends")
	}()

	select {
	case <-done:
		// Goroutine completed within the timeout
		log.Println("==> refresh completed successfully")
	case <-ctx.Done():
		// Context deadline exceeded (goroutine took too long)
		log.Println("==> refresh operation timed out and was cancelled")
	}
}

func FetchConferences(ctx context.Context, firestoreClient *firestore.Client) ([]Conference, error) {
	var conferences []Conference

	now := time.Now().UTC() // time.Date(2025, time.January, 1, 0, 0, 0, 0, time.UTC) // specific date
	startOfToday := now.Format("2006-01-02")
	log.Printf("==> fetching conferences with endDate>=%v", startOfToday)

	coll := firestoreClient.Collection("conferences")
	query := coll.Where("end_date", ">=", startOfToday).OrderBy("start_date", firestore.Asc)
	iter := query.Documents(ctx)
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		var conf Conference
		if err := doc.DataTo(&conf); err != nil {
			return nil, err
		}

		conferences = append(conferences, conf)
	}

	return conferences, nil
}
