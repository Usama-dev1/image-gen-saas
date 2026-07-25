"use client";

import { Upload, Plus, X, Rocket, Zap, Coins, Fingerprint } from "lucide-react";
import { useState } from "react";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const defaultTasks = [
  {
    id: 1,
    label: "Task 1: Outfit Variation",
    placeholder:
      "e.g., wearing a sleek cyberpunk jacket, neon lighting, rainy city background...",
  },
  {
    id: 2,
    label: "Task 2: Action Pose",
    placeholder: "e.g., jumping mid-air, dynamic angle, bright sunny day...",
  },
  {
    id: 3,
    label: "Task 3: Close-up Expression",
    placeholder:
      "e.g., smiling warmly, studio portrait lighting, shallow depth of field...",
  },
];

export type BatchViewProps = {};

export function BatchView(_props: BatchViewProps) {
  // Required use client due to local UI state for task range slider
  const [taskCount, setTaskCount] = useState(3);

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">
          Batch Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate multiple character poses at once.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Reference Upload */}
          <Card>
            <CardBody>
              <div>
                <CardTitle>Reference Character</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload a clear, front-facing image to maintain identity across
                  generations.
                </p>
              </div>
              <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-lg p-8 flex flex-col items-center justify-center gap-4 cursor-pointer bg-muted/30 hover:bg-muted/50 group mt-2">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Upload className="size-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-primary">
                    Click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Batch Settings */}
          <Card>
            <CardBody className="gap-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="size-4 text-primary" />
                </div>
                <CardTitle className="text-lg m-0">Batch Settings</CardTitle>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-foreground">
                      Generation Count
                    </label>
                    <span className="text-xs text-muted-foreground">Number of tasks to run</span>
                  </div>
                  <Badge className="badge-primary">
                    {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
                  </Badge>
                </div>
                <div className="pt-2 pb-1">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={taskCount}
                    onChange={(e) => setTaskCount(Number(e.target.value))}
                    className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer focus:outline-none"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                </div>
                <div className="flex justify-between text-xs font-medium text-muted-foreground/70">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>

              <div className="bg-muted/40 rounded-xl p-5 flex flex-col gap-5 border border-border/50 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Coins className="size-5 text-emerald-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        Estimated Cost
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {taskCount} × 5 Credits
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-500 flex items-baseline gap-1">
                      {taskCount * 5} <span className="text-sm font-semibold text-emerald-500/70">CR</span>
                    </span>
                  </div>
                </div>
                
                <div className="divider m-0 opacity-50"></div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Fingerprint className="size-5 text-blue-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        Remove Watermark
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Clean output images
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-base-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Tasks */}
        <div className="lg:col-span-7">
          <Card className="flex flex-col h-full max-h-[80vh]">
            <div className="p-6 pb-4 flex flex-col gap-4">
              <div className="flex items-end justify-between">
                <div>
                  <CardTitle>Configure Prompts</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define variations for each generation task.
                  </p>
                </div>
                <Button type="button" className="btn-outline btn-sm gap-1.5">
                  <Plus className="size-3.5" />
                  Add Task
                </Button>
              </div>
              <div className="divider m-0"></div>
            </div>

            <div className="flex-1 overflow-hidden px-6 pb-4">
              <div className="overflow-y-auto h-full pr-2">
                <div className="flex flex-col gap-4">
                  {defaultTasks.map((task) => (
                    <div key={task.id} className="flex flex-col gap-2 relative group">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold">
                          {task.label}
                        </label>
                        <Button type="button" className="btn-ghost btn-icon btn-xs text-muted-foreground hover:text-destructive transition-colors">
                          <X className="size-3.5" />
                        </Button>
                      </div>
                      <Textarea
                        className="w-full"
                        placeholder={task.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-center">
              <Button type="button" className="btn-primary btn-lg gap-2 shadow-lg shadow-primary/20 w-full md:w-auto md:min-w-[300px]">
                <Rocket className="size-4" />
                Start Batch Generation
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
