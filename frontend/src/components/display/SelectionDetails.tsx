import { MapPin, Hash, Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SelectionDetailsProps {
  city: {
    symbol: number;
    name: string;
  } | null;
  street: {
    id: number;
    name: string;
    citySymbol: number;
  } | null;
}

export function SelectionDetails({ city, street }: SelectionDetailsProps) {
  if (!city || !street) {
    return (
      <Card className="w-full" dir="rtl">
        <CardHeader>
          <CardTitle className="text-lg">הבחירה שלך</CardTitle>
          <CardDescription>
            בחר עיר ורחוב כדי לראות את הפרטים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24 text-gray-400">
            <MapPin className="h-8 w-8 opacity-30" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-gray-800/20 bg-gray-100" dir="rtl">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-700" />
          הבחירה שלך
        </CardTitle>
        <CardDescription>כתובת נבחרה בהצלחה</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Building2 className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-500">עיר</p>
            <p className="text-lg font-semibold">{city.name}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-500">רחוב</p>
            <p className="text-lg font-semibold">{street.name}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Hash className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-500">סמל ישוב</p>
            <p className="text-lg font-mono">{city.symbol}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
