package main

import (
	"context"
	"log"
	"sort"
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

		conf.SponsoredType = parseSponsored(doc, conf)

		conferences = append(conferences, conf)
	}

	sortConferences(conferences)
	return conferences, nil
}

func parseSponsored(doc *firestore.DocumentSnapshot, conf Conference) SponsoredType {
	if sponsoredTypeValue, ok := doc.Data()["sponsored_type"].(string); ok {
		if conf.SponsoredFrom != "" && conf.SponsoredTo != "" {
			sponsoredFrom, errFrom := time.Parse("2006-01-02", conf.SponsoredFrom)
			sponsoredTo, errTo := time.Parse("2006-01-02", conf.SponsoredTo)

			if errFrom == nil && errTo == nil {
				now := time.Now().UTC()

				// Check if current date is between SponsoredFrom (inclusive) and SponsoredTo (exclusive)
				if now.After(sponsoredFrom) && now.Before(sponsoredTo) {
					return ParseSponsoredType(sponsoredTypeValue)
				} else {
					return SponsoredTypeNone
				}
			} else {
				return SponsoredTypeNone // Default if date parsing fails
			}
		} else {
			return SponsoredTypeNone // Default if SponsoredFrom or SponsoredTo is empty
		}
	} else {
		return SponsoredTypeNone // Default if no sponsored_type value found
	}
}

func sortConferences(conferences []Conference) {
	sort.SliceStable(conferences, func(i, j int) bool {
		// Calculate priority for conference i
		iSponsored := conferences[i].IsSponsoredTop()
		iPromoted := conferences[i].IsPromoted()

		// Calculate priority for conference j
		jSponsored := conferences[j].IsSponsoredTop()
		jPromoted := conferences[j].IsPromoted()

		// First, prioritize both sponsored and promoted (highest priority)
		if iSponsored && iPromoted && !(jSponsored && jPromoted) {
			return true
		}
		if !(iSponsored && iPromoted) && jSponsored && jPromoted {
			return false
		}

		// Second, prioritize only sponsored
		if iSponsored && !iPromoted && !(jSponsored && !jPromoted) {
			return true
		}
		if !(iSponsored && !iPromoted) && jSponsored && !jPromoted {
			return false
		}

		// Third, prioritize only promoted
		if iPromoted && !iSponsored && !(jPromoted && !jSponsored) {
			return true
		}
		if !(iPromoted && !iSponsored) && jPromoted && !jSponsored {
			return false
		}

		// Default: maintain original order (return false)
		return false
	})
}
