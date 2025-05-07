import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_dir: string;
    humidity: number;
    feelslike_c: number;
    is_day: number;
  };
}

interface WeatherCardProps {
  data: WeatherData;
  className?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ data, className }) => {
  return (
    <>
      {
        data &&
        <Card className={cn("overflow-hidden gap-0 w-full max-w-md p-0 mb-2", className)}>
        <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-4 text-white">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <h2 className="text-4xl font-bold mb-1">{data?.current?.temp_c}°C</h2>
              <p className="text-xl font-medium">{data?.location?.name}</p>
              <p className="text-sm opacity-80">{data?.location?.region}, {data?.location?.country}</p>
            </div>
            <img src={data?.current?.condition?.icon} height={50} width={50} />
          </div>

          <div className="mt-4">
            <p className="text-lg">{data?.current?.condition?.text}</p>
            <p className="text-sm">Feels like {data?.current?.feelslike_c}°C</p>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50">
          <div className="flex justify-between text-sm text-gray-700">
            <div className="flex flex-col">
              <span>Wind</span>
              <span className="font-medium">{data?.current?.wind_kph} kph {data?.current?.wind_dir}</span>
            </div>
            <div className="flex flex-col">
              <span>Humidity</span>
              <span className="font-medium">{data?.current?.humidity}%</span>
            </div>
          </div>
        </div>
      </Card>}
    </>
  );
};

export default WeatherCard;
