import { Card } from "./ui/card";
import { Destination, Place } from "../types";
import { t } from "../locales/translations";
import { useThemeColors } from "../hooks/useThemeColors";
import { MapPin, Star, Clock, DollarSign, ExternalLink, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import React from "react";
import { parseAmount } from "../utils/parseAmount";

interface ViewModePlaceDetailsProps {
  place: Destination | null;
  language: "EN" | "VI";
  currency: "USD" | "VND";
  detailedDestination?: Place | null;
}

export function ViewModePlaceDetails({
  place,
  language,
  currency,
  detailedDestination
}: ViewModePlaceDetailsProps) {
  const lang = language.toLowerCase() as "en" | "vi";
  const { primary, secondary, light } = useThemeColors();
  const currencySymbol = currency === 'USD' ? 'USD' : 'VND';

  if (!place) {
    return (
      <Card
        className="flex-1 rounded-[24px] border border-[#E5E7EB] flex items-center justify-center"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
        }}
      >
        <div className="text-center text-gray-400 p-8">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{t("selectPlaceToView", lang)}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="flex-1 rounded-[24px] border border-[#E5E7EB] overflow-hidden"
      style={{
        background: "#FFFFFF",
        boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
      }}
    >
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="p-6 space-y-4">
          {/* Place Name */}
          <h2 className="text-gray-900 text-2xl">
            {language === "EN"
              ? (detailedDestination && Array.isArray(detailedDestination.en_names)
                ? detailedDestination.en_names[0]
                : (detailedDestination?.en_names || place.name))
              : (detailedDestination && Array.isArray(detailedDestination.vi_names)
                ? detailedDestination.vi_names[0]
                : (detailedDestination?.vi_names || place.name))}
          </h2>

          {/* Place Type */}
          {language === "EN" && detailedDestination?.best_type_id_en && (
            <div>
              <span
                className="inline-block text-sm px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: light,
                  color: primary,
                }}
              >
                {detailedDestination.best_type_id_en.charAt(0).toUpperCase() + detailedDestination.best_type_id_en.slice(1)}
              </span>
            </div>
          )}

          {language === "VI" && detailedDestination?.best_type_id_vi && (
            <div>
              <span
                className="inline-block text-sm px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: light,
                  color: primary,
                }}
              >
                {detailedDestination.best_type_id_vi.charAt(0).toUpperCase() + detailedDestination.best_type_id_vi.slice(1)}
              </span>
            </div>
          )}

          {/* Rating & Review Count */}
          {detailedDestination?.rating && (
            <div className="flex items-center gap-2">
              {/* Rating Badge */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: primary }}
              >
                <span className="text-white text-sm">
                  {detailedDestination.rating.toFixed(1)}
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((starIndex) => {
                    const rating = detailedDestination.rating || 0;
                    const isFullStar = starIndex <= Math.floor(rating);
                    const isHalfStar =
                      starIndex === Math.ceil(rating) && rating % 1 !== 0;

                    return (
                      <div key={starIndex} className="relative w-3.5 h-3.5">
                        <Star className="w-3.5 h-3.5 fill-gray-400 text-gray-400 absolute" />
                        {isFullStar && (
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 absolute" />
                        )}
                        {isHalfStar && (
                          <div className="absolute overflow-hidden w-1/2 h-full">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Count */}
              {detailedDestination?.reviews && (
                <span className="text-sm text-gray-600">
                  ({detailedDestination?.reviews.toLocaleString()}{" "}
                  {language === "EN" ? "reviews" : "đánh giá"})
                </span>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Address */}
          {place.address && (
            <div className="flex items-start gap-3 text-gray-700">
              <MapPin
                className="w-5 h-5 mt-0.5 shrink-0"
                style={{ color: primary }}
              />
              <span className="text-sm">{place.address}</span>
            </div>
          )}

          {/* Open Hours */}
          {detailedDestination?.hours && (
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-5 h-5 shrink-0" style={{ color: primary }} />
              <span className="text-sm">
                {(detailedDestination.hours ?? "")
                  .split("·")
                  .map((part, idx, arr) => (
                    <React.Fragment key={idx}>
                      {part.trim()}
                      {idx < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
              </span>
            </div>
          )}

          {/* Price Level */}
          {detailedDestination?.price && (
            <div className="flex items-center gap-3 text-gray-700">
              <Wallet className="w-4 h-4" />
              {(() => {
                const parsed = parseAmount(detailedDestination.price);
                return parsed.isApprox && parsed.min !== parsed.max
                  ? `${parsed.min.toLocaleString()} \u2013 ${parsed.max.toLocaleString()}`
                  : parsed.min.toLocaleString();
              })()} {currencySymbol}
            </div>
          )}

          {/* Detailed Information */}
          {language === "EN" && detailedDestination?.place_detail_en && (
            <div className="flex flex-col gap-3 text-gray-700">
              <div style={{ color: "#2563eb", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                Details
              </div>
              {Object.entries(detailedDestination.place_detail_en).map(([field, content]) => (
                <div key={field} style={{ marginBottom: 12 }}>
                  <div style={{ color: "#2563eb", fontWeight: 600 }}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </div>
                  <div style={{ color: "#111" }}>{content}</div>
                </div>
              ))}
            </div>
          )}
          {language === "VI" && detailedDestination?.place_detail_vi && (
            <div className="flex flex-col gap-3 text-gray-700">
              <div style={{ color: "#2563eb", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                Thông tin chi tiết
              </div>
              {Object.entries(detailedDestination.place_detail_vi).map(([field, content]) => (
                <div key={field} style={{ marginBottom: 12 }}>
                  <div style={{ color: "#2563eb", fontWeight: 600 }}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </div>
                  <div style={{ color: "#111" }}>{content}</div>
                </div>
              ))}
            </div>
          )}

          {/* Website Button */}
          {detailedDestination?.website && (
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full relative overflow-hidden group transition-all duration-200"
                onClick={() => window.open(detailedDestination.website, "_blank")}
                style={{
                  borderColor: primary,
                  borderWidth: "2px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 20px ${primary}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <ExternalLink
                  className="w-4 h-4 mr-2"
                  style={{ color: primary }}
                />
                <span style={{ color: primary }}>
                  {language === "EN" ? "Website" : "Trang web"}
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}