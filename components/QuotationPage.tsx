"use client";

import { materials } from "@/db/schema";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "./ui/table";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "./ui/button";

type Quote = {
  taskName: string;
  materials: (typeof materials.$inferSelect)[];
  cost: number;
};

export default function QuotationPage({
  projectName,
  quotes,
}: {
  projectName: string;
  quotes: Quote[];
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    bodyClass: "p-14 pt-14",
  });
  const quotesCost = quotes.map((quote) => {
    return quote.cost;
  });

  const totalCost = quotesCost.reduce((totalCost, currentCost) => {
    return totalCost + currentCost;
  }, 0);

  return (
    <div className="w-full min-h-screen flex flex-col gap-4 pt-8 md:pt-0">
      <div ref={contentRef} className="w-full flex flex-col md:pt-14 md:p-14">
        <h1 className="text-center font-bold text-2xl mb-12">
          QUOTATION FOR {projectName.toUpperCase()}
        </h1>
        {quotes.map((quote, index) => {
          return (
            <div key={quote.taskName + index}>
              <h2 className="font-bold">
                {index + 1}.{quote.taskName.toUpperCase()}
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Price per unit</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.materials.map((material) => {
                    return (
                      <TableRow key={material.id}>
                        <TableCell>{material.name}</TableCell>
                        <TableCell>{material.unit}</TableCell>
                        <TableCell>{material.price}</TableCell>
                        <TableCell>{material.quantity}</TableCell>
                        <TableCell className="text-right pr-0">
                          {material.quantity * material.price}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right pr-0">
                      {quote.cost}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          );
        })}
        <p className="font-bold self-end">{totalCost}</p>
      </div>
      <Button onClick={reactToPrintFn} className="w-fit self-end md:mr-14">
        Print quotation
      </Button>
    </div>
  );
}
