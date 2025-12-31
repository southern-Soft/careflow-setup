"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Package, Settings, FileText, Shield } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

export default function IOTDashboard() {
  return (
    <div className="flex flex-col gap-8 p-6 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Southern IOT Sales Framework
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Complete enterprise resource planning for ready-made garment manufacturing.
          Use the navigation menu on the left to access different modules.
        </p>
      </div>

      {/* System Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Dashboard Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Adding Orders</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Add clients and orders</li>
                <li>• Lorem Ipsum Lorem Ipsum Lorem Ipsum </li>

              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Calculating Price</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Calculate device prices</li>
                <li>• Lorem Ipsum Lorem Ipsum Lorem Ipsum</li>

              </ul>
            </div>

          </div>
        </CardContent>
      </Card>


    </div>
  );
}
