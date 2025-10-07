import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePrivacyContext } from "@/contexts/PrivacyContext";
import { Shield, Cookie, Database, Eye, Target, Zap } from "lucide-react";

export function PrivacyDebug() {
  const { consent, hasConsent, showBanner, resetConsent } = usePrivacyContext();

  if (!import.meta.env.DEV) return null;

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-600" />
          Privacy System Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <strong>Banner Visible:</strong>{" "}
          <Badge variant={showBanner ? "destructive" : "secondary"}>
            {showBanner ? "YES" : "NO"}
          </Badge>
        </div>

        <div>
          <strong>Consent Status:</strong>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              <span>Necessary:</span>
              <Badge variant={consent.necessary ? "default" : "secondary"}>
                {consent.necessary ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              <span>Functional:</span>
              <Badge variant={consent.functional ? "default" : "secondary"}>
                {consent.functional ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3" />
              <span>Analytics:</span>
              <Badge variant={consent.analytics ? "default" : "secondary"}>
                {consent.analytics ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-3 w-3" />
              <span>Marketing:</span>
              <Badge variant={consent.marketing ? "default" : "secondary"}>
                {consent.marketing ? "✓" : "✗"}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <strong>Consent Version:</strong> {consent.version}
        </div>

        <div>
          <strong>Last Updated:</strong>{" "}
          {new Date(consent.lastUpdated).toLocaleString()}
        </div>

        <div>
          <strong>Can Use Analytics:</strong>{" "}
          <Badge variant={hasConsent("analytics") ? "default" : "secondary"}>
            {hasConsent("analytics") ? "YES" : "NO"}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={resetConsent}>
            <Cookie className="h-3 w-3 mr-1" />
            Reset Consent
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <strong>Storage:</strong> localStorage key
          "larp_manager_privacy_consent"
        </div>
      </CardContent>
    </Card>
  );
}
