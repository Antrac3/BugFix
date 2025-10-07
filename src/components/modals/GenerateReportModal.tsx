import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  Users,
  Zap,
} from "lucide-react";
import { BaseModal } from "./BaseModal";
import { useApp } from "@/contexts/SupabaseAppContext";

const reportSchema = z.object({
  reportType: z.string().min(1, "Seleziona tipo di report"),
  dateRange: z.string().min(1, "Seleziona periodo"),
  format: z.enum(["pdf", "excel", "csv"]),
  includeCharts: z.boolean(),
  includeDetails: z.boolean(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GenerateReportModal({
  isOpen,
  onClose,
}: GenerateReportModalProps) {
  const { players, characters, messages } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      format: "pdf",
      includeCharts: true,
      includeDetails: true,
    },
  });

  const reportType = watch("reportType");
  const dateRange = watch("dateRange");
  const format = watch("format");

  const reportTypes = [
    { value: "players", label: "Report Giocatori", icon: Users },
    { value: "characters", label: "Report Personaggi", icon: Users },
    { value: "activity", label: "Report Attività", icon: BarChart3 },
    { value: "xp", label: "Report Esperienza", icon: Zap },
    { value: "messages", label: "Report Messaggi", icon: FileText },
    { value: "complete", label: "Report Completo", icon: BarChart3 },
  ];

  const dateRanges = [
    { value: "week", label: "Ultima Settimana" },
    { value: "month", label: "Ultimo Mese" },
    { value: "quarter", label: "Ultimo Trimestre" },
    { value: "year", label: "Ultimo Anno" },
    { value: "all", label: "Tutto il Periodo" },
  ];

  const onSubmit = async (data: ReportFormData) => {
    setIsGenerating(true);

    // Simula generazione report
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Crea mock report data
    const reportData = generateMockReport(data.reportType);

    // Simula download
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${data.reportType}-${new Date().toISOString().split("T")[0]}.${data.format}`;
    a.click();
    URL.revokeObjectURL(url);

    setIsGenerating(false);
    reset();
    onClose();
  };

  const generateMockReport = (type: string) => {
    const baseData = {
      generatedAt: new Date().toISOString(),
      reportType: type,
      period: dateRange,
      totalPlayers: players.length,
      activeCharacters: characters.filter((c) => c.status === "active").length,
      totalMessages: messages.length,
    };

    switch (type) {
      case "players":
        return {
          ...baseData,
          players: players.map((p) => ({
            name: `${p.firstName} ${p.lastName}`,
            role: p.role,
            status: p.status,
            joinDate: p.joinDate,
            charactersCount: p.characters.length,
          })),
        };
      case "characters":
        return {
          ...baseData,
          characters: characters.map((c) => ({
            name: c.name,
            role: c.role,
            player: c.player,
            xp: c.xp,
            status: c.status,
          })),
        };
      default:
        return baseData;
    }
  };

  const getReportPreview = () => {
    if (!reportType) return null;

    const selectedReport = reportTypes.find((r) => r.value === reportType);
    return selectedReport ? selectedReport.label : "Report";
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Genera Report"
      description="Crea report dettagliati sull'attività della campagna"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Report Type */}
        <div className="space-y-2">
          <Label>Tipo di Report</Label>
          <Select
            value={reportType}
            onValueChange={(value) => setValue("reportType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona tipo di report" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center space-x-2">
                    <type.icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.reportType && (
            <p className="text-sm text-red-500">{errors.reportType.message}</p>
          )}
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Periodo</Label>
          <Select
            value={dateRange}
            onValueChange={(value) => setValue("dateRange", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona periodo di analisi" />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{range.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.dateRange && (
            <p className="text-sm text-red-500">{errors.dateRange.message}</p>
          )}
        </div>

        {/* Format */}
        <div className="space-y-2">
          <Label>Formato Output</Label>
          <Select
            value={format}
            onValueChange={(value) =>
              setValue("format", value as "pdf" | "excel" | "csv")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel (.xlsx)</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeCharts"
              checked={watch("includeCharts")}
              onCheckedChange={(checked) =>
                setValue("includeCharts", !!checked)
              }
            />
            <Label htmlFor="includeCharts" className="text-sm">
              Includi grafici e visualizzazioni
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeDetails"
              checked={watch("includeDetails")}
              onCheckedChange={(checked) =>
                setValue("includeDetails", !!checked)
              }
            />
            <Label htmlFor="includeDetails" className="text-sm">
              Includi dettagli completi
            </Label>
          </div>
        </div>

        {/* Preview */}
        {reportType && dateRange && (
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Anteprima Report:
            </h4>
            <div className="space-y-1 text-sm">
              <div>📊 Tipo: {getReportPreview()}</div>
              <div>
                📅 Periodo:{" "}
                {dateRanges.find((r) => r.value === dateRange)?.label}
              </div>
              <div>📄 Formato: {format.toUpperCase()}</div>
              <div>
                📈 Include grafici: {watch("includeCharts") ? "Sì" : "No"}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            type="submit"
            disabled={isGenerating}
            className="flex-1 fantasy-button"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Generando Report..." : "Genera e Scarica"}
          </Button>

          <Button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            variant="outline"
            disabled={isGenerating}
            className="flex-1"
          >
            Annulla
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
