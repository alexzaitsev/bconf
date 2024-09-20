package main

import "google.golang.org/genproto/googleapis/type/latlng"

type Conference struct {
	Name              string         `firestore:"name"`
	Location          string         `firestore:"location"`
	PictureUrl        string         `firestore:"picture_url"`
	Flag              string         `firestore:"flag"`
	Continent         string         `firestore:"continent"`
	Coords            *latlng.LatLng `firestore:"coords"`
	StartDate         string         `firestore:"start_date"`
	EndDate           string         `firestore:"end_date"`
	Tz                string         `firestore:"tz"`
	Url               string         `firestore:"url"`
	SponsoredFrom     string         `firestore:"sponsored_from"`
	SponsoredTo       string         `firestore:"sponsored_to"`
	SponsoredType     SponsoredType  `firestore:"sponsored_type"`
	PromoCode         string         `firestore:"promo_code"`
	PromoCodeDiscount string         `firestore:"promo_code_discount"`
}

type SponsoredType string

const (
	SponsoredTypeCardFrame SponsoredType = "card_frame"
	SponsoredTypeCardTop   SponsoredType = "card_top"
	SponsoredTypeNone      SponsoredType = "" // For null or no match
)

func (c Conference) IsSponsoredTop() bool {
	return c.SponsoredType == SponsoredTypeCardTop
}

func (c Conference) IsPromoted() bool {
	return c.PromoCode != ""
}

func ParseSponsoredType(value string) SponsoredType {
	switch value {
	case string(SponsoredTypeCardFrame):
		return SponsoredTypeCardFrame
	case string(SponsoredTypeCardTop):
		return SponsoredTypeCardTop
	default:
		return SponsoredTypeNone // If the value doesn't match, return null equivalent
	}
}
