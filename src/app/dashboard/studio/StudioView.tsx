"use client";

import {
  Upload,
  Wand2,
  ChevronDown,
  Download,
  Share2,
  Image,
  Brush,
} from "lucide-react";

import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export type StudioViewProps = {};

export function StudioView(_props: StudioViewProps) {
  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tighter mb-1">AI Character Studio</h1>
        <p className="text-muted-foreground mt-1">Design consistent characters with precision.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Controls Panel */}
        <div className="md:col-span-5 flex flex-col gap-5">
          {/* Upload Reference */}
          <Card>
            <CardBody className="pb-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider m-0">Reference Image</div>
                <Badge className="badge-neutral">Required</Badge>
              </div>
              <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-muted/30 hover:bg-muted/50 group mt-2 h-40">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Upload className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center leading-tight">
                  <span className="block text-sm font-semibold group-hover:text-primary transition-colors">Click to upload</span>
                  <span className="block text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Prompt */}
          <Card>
            <CardBody className="pb-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider m-0">Prompt</div>
                <Button type="button" className="btn-ghost btn-sm text-primary">
                  <Wand2 className="size-3" />
                  Templates
                </Button>
              </div>
              <Textarea
                placeholder="Describe the character's pose, outfit, and environment in detail..."
                rows={4}
                className="mt-2"
              />
              <p className="text-[10px] text-muted-foreground text-right mt-2 mb-0">
                0 / 1000
              </p>
            </CardBody>
          </Card>

          {/* Model & Settings */}
          <Card>
            <CardBody className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block">
                  AI Model
                </label>
                <div className="relative">
                  <Select className="w-full appearance-none pr-8 cursor-pointer" defaultValue="seedream">
                    <option value="gpt">GPT Image 2 Low (Fast)</option>
                    <option value="kling">Kling IMAGE 3.0 (Realistic)</option>
                    <option value="seedream">Seedream 5.0 Pro (High Quality)</option>
                  </Select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block">
                    Aspect Ratio
                  </label>
                  <div className="relative">
                    <Select className="w-full appearance-none pr-8 cursor-pointer" defaultValue="34">
                      <option value="11">1:1 Square</option>
                      <option value="34">3:4 Portrait</option>
                      <option value="169">16:9 Landscape</option>
                    </Select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block">
                    Quality
                  </label>
                  <div className="relative">
                    <Select className="w-full appearance-none pr-8 cursor-pointer" defaultValue="hd">
                      <option value="standard">Standard</option>
                      <option value="hd">HD</option>
                    </Select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button type="button" className="btn-outline flex-1 max-w-[120px]">
              Clear
            </Button>
            <Button type="button" className="btn-primary flex-1">
              <Brush className="size-4" />
              Generate (1 Credit)
            </Button>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="md:col-span-7">
          <Card className="flex flex-col h-[500px] md:min-h-[700px] overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider m-0">Preview Canvas</div>
              <div className="flex gap-2">
                <Button type="button" className="btn-ghost btn-icon">
                  <Download className="size-4" />
                </Button>
                <Button type="button" className="btn-ghost btn-icon">
                  <Share2 className="size-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center relative bg-base-100">
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <Image className="size-10 text-muted-foreground" />
                <p>
                  Your generated character will appear here. Adjust settings and
                  prompt to refine.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
