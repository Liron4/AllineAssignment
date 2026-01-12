"use client";

import { useState, useTransition } from "react";
import { CitySelector, type City } from "@/components/selectors/CitySelector";
import {
  StreetSelector,
  type Street,
} from "@/components/selectors/StreetSelector";
import { SelectionDetails } from "@/components/display/SelectionDetails";
import { getStreetsByCity } from "@/actions/street-actions";
import citiesData from "@/data/cities_cache.json";

// Type the imported JSON
const cities: City[] = citiesData as City[];

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedStreet, setSelectedStreet] = useState<Street | null>(null);
  const [availableStreets, setAvailableStreets] = useState<Street[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleCitySelect = (city: City | null) => {
    // Reset street when city changes
    setSelectedCity(city);
    setSelectedStreet(null);
    setAvailableStreets([]);

    if (city) {
      // Fetch streets for the selected city
      startTransition(async () => {
        const streets = await getStreetsByCity(city.symbol);
        setAvailableStreets(streets);
      });
    }
  };

  const handleStreetSelect = (street: Street | null) => {
    setSelectedStreet(street);
  };

  return (
    <main className="min-h-screen bg-white p-8" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">בחירת כתובת</h1>
          <p className="text-gray-500">
            בחר עיר ורחוב מתוך מאגר הנתונים
          </p>
        </div>

        {/* Selectors */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">עיר</label>
            <CitySelector
              cities={cities}
              selectedCity={selectedCity}
              onSelect={handleCitySelect}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">רחוב</label>
            <StreetSelector
              streets={availableStreets}
              selectedStreet={selectedStreet}
              onSelect={handleStreetSelect}
              hasSelectedCity={selectedCity !== null}
              isLoading={isPending}
            />
          </div>
        </div>

        {/* Selection Details */}
        <SelectionDetails city={selectedCity} street={selectedStreet} />

        {/* Stats */}
        <div className="text-center text-sm text-gray-500">
          <p>
            {cities.length} ערים במאגר
            {selectedCity && ` • ${availableStreets.length} רחובות ב${selectedCity.name}`}
          </p>
        </div>
      </div>
    </main>
  );
}
