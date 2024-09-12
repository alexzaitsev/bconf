package main

import "google.golang.org/genproto/googleapis/type/latlng"

type Conference struct {
	Name      string         `firestore:"name"`
	Location  string         `firestore:"location"`
	Continent string         `firestore:"continent"`
	Coords    *latlng.LatLng `firestore:"coords"`
	StartDate string         `firestore:"start_date"`
	EndDate   string         `firestore:"end_date"`
	Tz        string         `firestore:"tz"`
	Url       string         `firestore:"url"`
}
