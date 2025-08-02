import { useTranslations, useLocale } from "next-intl";
import { Share2 } from "lucide-react";
import { useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { School } from "@/types/School";

type Props = {
  school: School | null;
};

export default function OverviewCard({ school }: Props) {
  const t = useTranslations("ProjectDetails.overview");
  const locale = useLocale();
  const pathname = usePathname();
  const [shareButtonText, setShareButtonText] = useState("shareButtonText");

  const handleShareClick = () => {
    // Create the full URL with locale
    const fullUrl = `${window.location.origin}/${locale}${pathname}`;

    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        setShareButtonText("shareButtonTextCopied");
        setTimeout(() => {
          setShareButtonText("shareButtonText");
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
      });
  };

  console.log("School data:", school);

  // If no school data is available
  if (!school) {
    return (
      <div className="flex-1 card">
        <h3 className="font-bold text-2xl">School Overview</h3>
        <p className="text-gray-500">No school information available</p>
      </div>
    );
  }

  return (
    <div className="flex-1 card">
      <span>
        <h3 className="font-bold text-2xl">School Overview</h3>
        <span className="text-muted-foreground text-xs">
          Created on {new Date(school.createdAt).toLocaleDateString()}
        </span>
      </span>
      <div>
        <div className="flex flex-col items-start gap-5 mt-6 pt-4 border-gray-100 border-t">
          <div className="flex gap-2.5">
            <h3 className="font-medium">School Name:</h3>
            <span>{school.name}</span>
          </div>
          <div className="flex gap-2.5">
            <h3 className="font-medium">Current Status:</h3>
            <div className="flex items-center">
              <span className="bg-green-100 px-3 py-1 rounded-full font-medium text-green-800 text-sm">
                Active
              </span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <h3 className="font-medium">Final Goal:</h3>
            <span>
              {school.goal}% ({school.deadlineYear})
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-auto">
        <button
          className="bg-white mt-auto w-fit btn btn-soft"
          onClick={handleShareClick}
        >
          <Share2 className="mr-2 w-4 h-4" />
          {t(shareButtonText)}
        </button>
      </div>
    </div>
  );
}
