// Auto-generated 1:1 from the 10 uploaded Google Sheets .xlsx files
export interface SheetMerge { ref: string; r1: number; c1: number; r2: number; c2: number; }
export interface SheetCell {
  v?: string | number;
  f?: string;
  gf?: string;
  bg?: string;
  fg?: string;
  b?: boolean;
  i?: boolean;
  sz?: number;
  al?: string;
  bd?: boolean;
  fmt?: 'percent' | 'date' | 'currency2' | 'currency0' | 'integer' | 'number2';
  cm?: string;
}
export interface SheetData {
  id: string;
  title: string;
  maxCol: number;
  maxRow: number;
  colWidths: Record<number, number>;
  merges: SheetMerge[];
  cells: Record<string, SheetCell>;
}

export const INITIAL_SHEETS_DATA: SheetData[] = [
  {
    "id": "overview",
    "title": "Overview",
    "maxCol": 10,
    "maxRow": 35,
    "colWidths": {
      "1": 95,
      "2": 109,
      "3": 109,
      "4": 109,
      "5": 109,
      "6": 109,
      "7": 109,
      "8": 95,
      "9": 115,
      "10": 115
    },
    "merges": [
      {
        "ref": "I13:J13",
        "r1": 13,
        "c1": 9,
        "r2": 13,
        "c2": 10
      },
      {
        "ref": "I23:J23",
        "r1": 23,
        "c1": 9,
        "r2": 23,
        "c2": 10
      },
      {
        "ref": "B1:F1",
        "r1": 1,
        "c1": 2,
        "r2": 1,
        "c2": 6
      },
      {
        "ref": "B2:D2",
        "r1": 2,
        "c1": 2,
        "r2": 2,
        "c2": 4
      },
      {
        "ref": "B3:D3",
        "r1": 3,
        "c1": 2,
        "r2": 3,
        "c2": 4
      },
      {
        "ref": "C5:F5",
        "r1": 5,
        "c1": 3,
        "r2": 5,
        "c2": 6
      },
      {
        "ref": "C6:F6",
        "r1": 6,
        "c1": 3,
        "r2": 6,
        "c2": 6
      },
      {
        "ref": "B8:G8",
        "r1": 8,
        "c1": 2,
        "r2": 8,
        "c2": 7
      }
    ],
    "cells": {
      "A1": {
        "v": "АЕД",
        "fg": "#FFFFFF"
      },
      "B1": {
        "v": "Fair Value Calculators 2026",
        "fg": "#373F6B",
        "b": true,
        "i": true,
        "sz": 18.0,
        "bd": true
      },
      "C1": {
        "bd": true
      },
      "D1": {
        "bd": true
      },
      "E1": {
        "bd": true
      },
      "F1": {
        "bd": true
      },
      "G1": {
        "fg": "#000000",
        "b": true,
        "sz": 8.0,
        "bd": true
      },
      "H1": {
        "fg": "#000000",
        "bd": true
      },
      "I1": {
        "fg": "#000000",
        "al": "left",
        "bd": true
      },
      "J1": {
        "fg": "#000000",
        "al": "left",
        "bd": true
      },
      "B2": {
        "v": "Enter stock symbol in cell B5",
        "i": true
      },
      "B3": {
        "v": "The values are shown in thousands",
        "i": true
      },
      "B5": {
        "v": "SYK",
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true
      },
      "C5": {
        "v": "<< enter a symbol",
        "fg": "#CCCCCC"
      },
      "G5": {
        "v": "Data",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B6": {
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true
      },
      "C6": {
        "v": "<< optionally, enter an exchange (ex: NASDAQ, NYSE)",
        "fg": "#CCCCCC"
      },
      "G6": {
        "v": "2026-10-01",
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "date"
      },
      "B8": {
        "v": "Stryker Corp",
        "gf": "GOOGLEFINANCE(B23,\"name\"",
        "sz": 20.0,
        "bd": true
      },
      "C8": {
        "bd": true
      },
      "D8": {
        "bd": true
      },
      "E8": {
        "bd": true
      },
      "F8": {
        "bd": true
      },
      "G8": {
        "bd": true
      },
      "C10": {
        "v": "3 Year Return",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E10": {
        "v": "5 Year Return",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G10": {
        "v": "10 Year Return",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "C11": {
        "v": "#REF!",
        "gf": "(GOOGLEFINANCE('Stock Valuation'!B2,\"price\"",
        "fg": "#38761D",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "E11": {
        "v": "#REF!",
        "gf": "(GOOGLEFINANCE('Stock Valuation'!B2,\"price\"",
        "fg": "#38761D",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "G11": {
        "v": "#REF!",
        "gf": "(GOOGLEFINANCE('Stock Valuation'!B2,\"price\"",
        "fg": "#38761D",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D12": {
        "v": " "
      },
      "B13": {
        "v": "Current Price",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "C13": {
        "v": "Change",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D13": {
        "v": "% Change",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E13": {
        "v": "52W Low",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F13": {
        "v": "  52W High",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G13": {
        "v": "Average Price:",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "I13": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "J13": {
        "bd": true
      },
      "B14": {
        "v": 301.85,
        "gf": "GOOGLEFINANCE(B23,\"price\"",
        "sz": 11.0,
        "al": "center",
        "fmt": "number2"
      },
      "C14": {
        "v": -4.49,
        "gf": "IFERROR(GOOGLEFINANCE(B23,\"change\"",
        "sz": 11.0,
        "al": "center"
      },
      "D14": {
        "v": -0.0147,
        "gf": "IFERROR(GOOGLEFINANCE(B23,\"changepct\"",
        "sz": 11.0,
        "al": "center",
        "fmt": "percent"
      },
      "E14": {
        "v": 267.0,
        "gf": "GOOGLEFINANCE(B5,\"low52\"",
        "fg": "#FF0000",
        "sz": 11.0,
        "al": "center",
        "fmt": "number2"
      },
      "F14": {
        "v": 389.33,
        "gf": "GOOGLEFINANCE(B5,\"high52\"",
        "fg": "#00B050",
        "sz": 11.0,
        "al": "center",
        "fmt": "number2"
      },
      "G14": {
        "v": 248.6233917,
        "f": "AVERAGEIF(F35:F5007,\"<>0\")",
        "fg": "#000000",
        "sz": 11.0,
        "al": "center",
        "fmt": "number2"
      },
      "I14": {
        "v": "Amount Invested",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "J14": {
        "v": 38.0,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "B15": {
        "bd": true
      },
      "C15": {
        "bd": true
      },
      "D15": {
        "bd": true
      },
      "E15": {
        "bd": true
      },
      "F15": {
        "bd": true
      },
      "G15": {
        "bd": true
      },
      "I15": {
        "v": "Amount Returned",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "J15": {
        "v": 337.0,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "I16": {
        "v": "Years",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "J16": {
        "v": 10,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "right",
        "bd": true
      },
      "B17": {
        "v": "Market Cap",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "C17": {
        "v": "Shares",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D17": {
        "v": "P/E Ratio",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E17": {
        "v": "EPS",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F17": {
        "v": "Beta",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G17": {
        "v": "Dividend Yeld",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center"
      },
      "I17": {
        "fg": "#000000",
        "bd": true
      },
      "J17": {
        "fg": "#000000",
        "bd": true
      },
      "B18": {
        "v": 115819841.8,
        "gf": "GOOGLEFINANCE(B5,\"marketcap\"",
        "sz": 11.0,
        "al": "center",
        "fmt": "integer"
      },
      "C18": {
        "v": 383573,
        "gf": "GOOGLEFINANCE(B5,\"shares\"",
        "sz": 11.0,
        "al": "center",
        "fmt": "integer"
      },
      "D18": {
        "v": 31.29,
        "gf": "IFERROR(GOOGLEFINANCE(B23,\"pe\"",
        "sz": 11.0,
        "al": "center",
        "fmt": "number2"
      },
      "E18": {
        "v": 9.65,
        "gf": "GOOGLEFINANCE(B5,\"eps\"",
        "sz": 11.0,
        "al": "center"
      },
      "F18": {
        "v": 0.77,
        "gf": "IFERROR(GOOGLEFINANCE(B23,\"beta\"",
        "sz": 11.0,
        "al": "center",
        "fmt": "number2"
      },
      "G18": {
        "v": " 12.54% ",
        "gf": "IFERROR(substitute(SUBSTITUTE(index(importhtml(\"http://finviz.com/quote.ashx?t=\"&B5,\"table\",9),8,2),\"*\",\" \"",
        "sz": 11.0,
        "al": "center"
      },
      "I18": {
        "v": "ROI",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "J18": {
        "v": 7.868421053,
        "f": "(J15 - J14) / J14",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "I19": {
        "v": "Annualized ROI",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "cm": "CAGR"
      },
      "J19": {
        "v": 0.2438976016,
        "f": "((1+(J15-J14)/J14)^(1/J16)-1)",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "G20": {
        "v": "120 Months",
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true
      },
      "I20": {
        "v": "Gain",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "J20": {
        "v": 299.0,
        "f": "J15-J14",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "B23": {
        "v": "SYK",
        "f": "IF(ISBLANK(B6),\"\",B6&\":\")&B5",
        "fg": "#FFFFFF"
      },
      "I23": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "J23": {
        "bd": true
      },
      "I24": {
        "v": "Amount Invested",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "J24": {
        "v": 32.31,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "I25": {
        "v": "Amount Returned",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "J25": {
        "v": 23.34,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "I26": {
        "v": "Years",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "J26": {
        "v": 10,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "right",
        "bd": true
      },
      "I27": {
        "fg": "#000000",
        "bd": true
      },
      "J27": {
        "fg": "#000000",
        "bd": true
      },
      "I28": {
        "v": "ROI",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "J28": {
        "v": -0.2776230269,
        "f": "(J25 - J24) / J24",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "I29": {
        "v": "Annualized ROI",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "cm": "CAGR"
      },
      "J29": {
        "v": -0.03199769963,
        "f": "((1+(J25-J24)/J24)^(1/J26)-1)",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "I30": {
        "v": "Gain",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "J30": {
        "v": -8.97,
        "f": "J25-J24",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "B34": {
        "v": "Date",
        "gf": "GOOGLEFINANCE(B23, \"all\", EDATE(TODAY(), -LEFT(G20, FIND(\" \", G20))), TODAY(), \"DAILY\"",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "C34": {
        "v": "Open",
        "gf": "\"COMPUTED_VALUE\"",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D34": {
        "v": "High",
        "gf": "\"COMPUTED_VALUE\"",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E34": {
        "v": "Low",
        "gf": "\"COMPUTED_VALUE\"",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F34": {
        "v": "Close",
        "gf": "\"COMPUTED_VALUE\"",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G34": {
        "v": "Volume",
        "gf": "\"COMPUTED_VALUE\"",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B35": {
        "v": "2016-10-27",
        "gf": "\"COMPUTED_VALUE\"",
        "al": "right",
        "fmt": "date"
      },
      "C35": {
        "v": 110.5,
        "gf": "\"COMPUTED_VALUE\"",
        "al": "right",
        "fmt": "number2"
      },
      "D35": {
        "v": 110.62,
        "gf": "\"COMPUTED_VALUE\"",
        "al": "right",
        "fmt": "number2"
      },
      "E35": {
        "v": 109.31,
        "gf": "\"COMPUTED_VALUE\"",
        "al": "right",
        "fmt": "number2"
      },
      "F35": {
        "v": 109.72,
        "gf": "\"COMPUTED_VALUE\"",
        "al": "right",
        "fmt": "number2"
      },
      "G35": {
        "v": 1751572,
        "gf": "\"COMPUTED_VALUE\"",
        "al": "right",
        "fmt": "integer"
      }
    }
  },
  {
    "id": "stockValuation",
    "title": "Stock Valuation",
    "maxCol": 19,
    "maxRow": 60,
    "colWidths": {
      "1": 320,
      "2": 160,
      "3": 160,
      "4": 83,
      "5": 115,
      "6": 115,
      "7": 83,
      "8": 83,
      "9": 83,
      "10": 83,
      "11": 83,
      "12": 83,
      "13": 83,
      "14": 83,
      "15": 83,
      "16": 83,
      "17": 83,
      "18": 83,
      "19": 83
    },
    "merges": [
      {
        "ref": "B50:C50",
        "r1": 50,
        "c1": 2,
        "r2": 50,
        "c2": 3
      },
      {
        "ref": "B51:C51",
        "r1": 51,
        "c1": 2,
        "r2": 51,
        "c2": 3
      },
      {
        "ref": "B52:C52",
        "r1": 52,
        "c1": 2,
        "r2": 52,
        "c2": 3
      },
      {
        "ref": "B53:C53",
        "r1": 53,
        "c1": 2,
        "r2": 53,
        "c2": 3
      },
      {
        "ref": "B54:C54",
        "r1": 54,
        "c1": 2,
        "r2": 54,
        "c2": 3
      },
      {
        "ref": "B55:C55",
        "r1": 55,
        "c1": 2,
        "r2": 55,
        "c2": 3
      },
      {
        "ref": "B56:C56",
        "r1": 56,
        "c1": 2,
        "r2": 56,
        "c2": 3
      },
      {
        "ref": "B57:C57",
        "r1": 57,
        "c1": 2,
        "r2": 57,
        "c2": 3
      },
      {
        "ref": "B58:C58",
        "r1": 58,
        "c1": 2,
        "r2": 58,
        "c2": 3
      },
      {
        "ref": "B59:C59",
        "r1": 59,
        "c1": 2,
        "r2": 59,
        "c2": 3
      },
      {
        "ref": "B60:C60",
        "r1": 60,
        "c1": 2,
        "r2": 60,
        "c2": 3
      },
      {
        "ref": "H5:M18",
        "r1": 5,
        "c1": 8,
        "r2": 18,
        "c2": 13
      },
      {
        "ref": "N5:S18",
        "r1": 5,
        "c1": 14,
        "r2": 18,
        "c2": 19
      },
      {
        "ref": "H19:M32",
        "r1": 19,
        "c1": 8,
        "r2": 32,
        "c2": 13
      },
      {
        "ref": "N19:S32",
        "r1": 19,
        "c1": 14,
        "r2": 32,
        "c2": 19
      },
      {
        "ref": "H33:M46",
        "r1": 33,
        "c1": 8,
        "r2": 46,
        "c2": 13
      },
      {
        "ref": "N33:S46",
        "r1": 33,
        "c1": 14,
        "r2": 46,
        "c2": 19
      },
      {
        "ref": "B1:C1",
        "r1": 1,
        "c1": 2,
        "r2": 1,
        "c2": 3
      },
      {
        "ref": "B2:C2",
        "r1": 2,
        "c1": 2,
        "r2": 2,
        "c2": 3
      },
      {
        "ref": "B3:C3",
        "r1": 3,
        "c1": 2,
        "r2": 3,
        "c2": 3
      },
      {
        "ref": "B4:C4",
        "r1": 4,
        "c1": 2,
        "r2": 4,
        "c2": 3
      },
      {
        "ref": "A5:A6",
        "r1": 5,
        "c1": 1,
        "r2": 6,
        "c2": 1
      },
      {
        "ref": "B5:C6",
        "r1": 5,
        "c1": 2,
        "r2": 6,
        "c2": 3
      },
      {
        "ref": "E5:F5",
        "r1": 5,
        "c1": 5,
        "r2": 5,
        "c2": 6
      },
      {
        "ref": "B7:C7",
        "r1": 7,
        "c1": 2,
        "r2": 7,
        "c2": 3
      },
      {
        "ref": "B9:C9",
        "r1": 9,
        "c1": 2,
        "r2": 9,
        "c2": 3
      },
      {
        "ref": "B11:C11",
        "r1": 11,
        "c1": 2,
        "r2": 11,
        "c2": 3
      },
      {
        "ref": "B13:C13",
        "r1": 13,
        "c1": 2,
        "r2": 13,
        "c2": 3
      },
      {
        "ref": "B14:C14",
        "r1": 14,
        "c1": 2,
        "r2": 14,
        "c2": 3
      },
      {
        "ref": "E15:F15",
        "r1": 15,
        "c1": 5,
        "r2": 15,
        "c2": 6
      },
      {
        "ref": "B16:C16",
        "r1": 16,
        "c1": 2,
        "r2": 16,
        "c2": 3
      },
      {
        "ref": "B17:C17",
        "r1": 17,
        "c1": 2,
        "r2": 17,
        "c2": 3
      },
      {
        "ref": "B18:C18",
        "r1": 18,
        "c1": 2,
        "r2": 18,
        "c2": 3
      },
      {
        "ref": "B19:C19",
        "r1": 19,
        "c1": 2,
        "r2": 19,
        "c2": 3
      },
      {
        "ref": "B21:C21",
        "r1": 21,
        "c1": 2,
        "r2": 21,
        "c2": 3
      },
      {
        "ref": "B22:C22",
        "r1": 22,
        "c1": 2,
        "r2": 22,
        "c2": 3
      },
      {
        "ref": "B23:C23",
        "r1": 23,
        "c1": 2,
        "r2": 23,
        "c2": 3
      },
      {
        "ref": "B24:C24",
        "r1": 24,
        "c1": 2,
        "r2": 24,
        "c2": 3
      },
      {
        "ref": "B26:C26",
        "r1": 26,
        "c1": 2,
        "r2": 26,
        "c2": 3
      },
      {
        "ref": "B27:C27",
        "r1": 27,
        "c1": 2,
        "r2": 27,
        "c2": 3
      },
      {
        "ref": "B28:C28",
        "r1": 28,
        "c1": 2,
        "r2": 28,
        "c2": 3
      },
      {
        "ref": "B29:C29",
        "r1": 29,
        "c1": 2,
        "r2": 29,
        "c2": 3
      },
      {
        "ref": "B30:C30",
        "r1": 30,
        "c1": 2,
        "r2": 30,
        "c2": 3
      },
      {
        "ref": "B31:C31",
        "r1": 31,
        "c1": 2,
        "r2": 31,
        "c2": 3
      },
      {
        "ref": "B32:C32",
        "r1": 32,
        "c1": 2,
        "r2": 32,
        "c2": 3
      },
      {
        "ref": "B34:C34",
        "r1": 34,
        "c1": 2,
        "r2": 34,
        "c2": 3
      },
      {
        "ref": "B35:C35",
        "r1": 35,
        "c1": 2,
        "r2": 35,
        "c2": 3
      },
      {
        "ref": "B36:C36",
        "r1": 36,
        "c1": 2,
        "r2": 36,
        "c2": 3
      },
      {
        "ref": "B38:C38",
        "r1": 38,
        "c1": 2,
        "r2": 38,
        "c2": 3
      },
      {
        "ref": "B40:C40",
        "r1": 40,
        "c1": 2,
        "r2": 40,
        "c2": 3
      },
      {
        "ref": "B41:C41",
        "r1": 41,
        "c1": 2,
        "r2": 41,
        "c2": 3
      },
      {
        "ref": "B42:C42",
        "r1": 42,
        "c1": 2,
        "r2": 42,
        "c2": 3
      },
      {
        "ref": "B43:C43",
        "r1": 43,
        "c1": 2,
        "r2": 43,
        "c2": 3
      },
      {
        "ref": "B44:C44",
        "r1": 44,
        "c1": 2,
        "r2": 44,
        "c2": 3
      },
      {
        "ref": "B45:C45",
        "r1": 45,
        "c1": 2,
        "r2": 45,
        "c2": 3
      },
      {
        "ref": "B46:C46",
        "r1": 46,
        "c1": 2,
        "r2": 46,
        "c2": 3
      },
      {
        "ref": "B47:C47",
        "r1": 47,
        "c1": 2,
        "r2": 47,
        "c2": 3
      },
      {
        "ref": "B48:C48",
        "r1": 48,
        "c1": 2,
        "r2": 48,
        "c2": 3
      },
      {
        "ref": "B49:C49",
        "r1": 49,
        "c1": 2,
        "r2": 49,
        "c2": 3
      }
    ],
    "cells": {
      "A1": {
        "v": "Company",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "sz": 12.0,
        "al": "center",
        "bd": true
      },
      "B1": {
        "v": "#REF!",
        "f": "Overview!B8",
        "gf": "GOOGLEFINANCE(B2,\"name\"",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "sz": 12.0,
        "al": "center",
        "bd": true
      },
      "C1": {
        "bd": true
      },
      "E1": {
        "v": "Data",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F1": {
        "v": "#REF!",
        "f": "Overview!G6",
        "bg": "#93C47D",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "date"
      },
      "A2": {
        "v": "Tickr",
        "bg": "#EFEFEF",
        "fg": "#000000",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B2": {
        "v": "#REF!",
        "f": "Overview!B5",
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "C2": {
        "bd": true
      },
      "A3": {
        "v": "Industry",
        "fg": "#000000",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B3": {
        "v": "Medical Devices",
        "gf": "IMPORTXML(\"https://stockanalysis.com/stocks/\"&B2,\"/html/body/div/div[1]/div[2]/main/div[3]/div[1]/div[1]/div/div[1]/a\"",
        "fg": "#000000",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "date"
      },
      "C3": {
        "bd": true
      },
      "A4": {
        "v": "Sector",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B4": {
        "v": "Healthcare",
        "gf": "IMPORTXML(\"https://stockanalysis.com/stocks/\"&B2,\"/html/body/div/div[1]/div[2]/main/div[3]/div[1]/div[1]/div/div[2]/a\"",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C4": {
        "bd": true
      },
      "A5": {
        "v": "Undervalued / Overvalued",
        "b": true,
        "sz": 12.0,
        "al": "center",
        "bd": true
      },
      "B5": {
        "v": "#REF!",
        "f": "B54/B7-1",
        "bg": "#D9EAD3",
        "b": true,
        "sz": 12.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C5": {
        "bd": true
      },
      "E5": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "F5": {
        "bd": true
      },
      "A6": {
        "bd": true
      },
      "B6": {
        "bd": true
      },
      "C6": {
        "bd": true
      },
      "E6": {
        "v": "Amount Invested",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F6": {
        "v": 81958.0,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "A7": {
        "v": "Current Price",
        "bg": "#EFEFEF",
        "fg": "#1155CC",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B7": {
        "v": "#REF!",
        "f": "Overview!B14",
        "gf": "GOOGLEFINANCE(B2)",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "C7": {
        "bd": true
      },
      "E7": {
        "v": "Amount Returned",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F7": {
        "v": 1159897.0,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "A8": {
        "v": "52 week low / 52 week high",
        "fg": "#1155CC",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B8": {
        "v": "#REF!",
        "f": "Overview!E14",
        "gf": "GOOGLEFINANCE(B2,\"low52\"",
        "bg": "#E06666",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "C8": {
        "v": "#REF!",
        "f": "Overview!F14",
        "gf": "GOOGLEFINANCE(B2,\"high52\"",
        "bg": "#6AA84F",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "E8": {
        "v": "Years",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F8": {
        "v": 5,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "A9": {
        "v": "Market Cap",
        "bg": "#EFEFEF",
        "fg": "#1155CC",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B9": {
        "v": "#REF!",
        "f": "Overview!B18",
        "gf": "GOOGLEFINANCE(B2,\"marketcap\"",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "C9": {
        "bd": true
      },
      "E9": {
        "fg": "#000000",
        "bd": true
      },
      "F9": {
        "fg": "#000000",
        "bd": true
      },
      "A10": {
        "v": "P/E Ratio",
        "fg": "#1155CC",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "PE Ratio = Stock Price / Earnings Per Share\n\nДРУГА ФОРМУЛА:\nPE Ratio = Market Cap / Net Income\n\nСъотношението цена към печалба (PE) е съотношението между цената на акциите на компанията и печалбата на акция. Той измерва цената на акцията спрямо нейните печалби.\n\nВъпреки това, ето обща насока за добри съотношения на PE въз основа на темпа на растеж:\nhttps://www.lynalden.com/pe-ratio/\n\nБез растеж: 10 или по-малко\nБавен растеж: 12\nУмерен растеж: 15\nБърз растеж: 25+\n\nВъпреки това, никога не трябва да инвестирате само въз основа на съотношението PE. \nНяма едно число, което да ви каже дали една инвестиция е добра идея."
      },
      "B10": {
        "v": "#REF!",
        "f": "Overview!D18",
        "gf": "GOOGLEFINANCE(B2,\"pe\"",
        "bg": "#FDE49A",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "C10": {
        "v": "Високо",
        "bg": "#FDE49A",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "E10": {
        "v": "ROI",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F10": {
        "v": 13.15233412,
        "f": "(F7 - F6) / F6",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A11": {
        "v": "Price to FCF",
        "bg": "#EFEFEF",
        "fg": "#1155CC",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Price to FCF = Stock Price / FCF per share\nЗа разлика от P/E ratio-то, това съотношение ни показва по-истински данни за реалния кеш, с който дружеството разполага, а не с обявените печалби, които са манипулируеми до известна степен според GAAP. \n\nПо-ниската стойност от P/E ratio е по-добрата стойност."
      },
      "B11": {
        "v": 27.04,
        "gf": "(SUBSTITUTE(index(importhtml(\"http://finviz.com/quote.ashx?t=\"&B2,\"table\",9),7,4),\"*\",\"\"",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "C11": {
        "bd": true
      },
      "E11": {
        "v": "Annualized ROI",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F11": {
        "v": 0.6988913873,
        "f": "((1+(F7-F6)/F6)^(1/F8)-1)",
        "fg": "#FF0000",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A12": {
        "v": "Dividend Yield",
        "fg": "#1155CC",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Dividend yield = ($5 / $100) x 100 = 5%\n\nКогато цената падне с 50%, ето какво се случва, ако приемем, че\nкомпанията запази годишния дивидент от $5 непроменен:\n\nDividend yield = ($5 / $50) x 100 = 10%"
      },
      "B12": {
        "v": "#REF!",
        "f": "Overview!G18",
        "gf": "if(B2=\"\",\"\",SUBSTITUTE(index(importhtml(\"http://finviz.com/quote.ashx?t=\"&B2,\"table\",9),8,2),\"*\",\"\"",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C12": {
        "v": "#REF!",
        "f": "MID(B12, 1, 4)",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "E12": {
        "v": "Gain",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F12": {
        "v": 1077939.0,
        "f": "F7-F6",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "A13": {
        "v": "Dividend Payout Ratio",
        "bg": "#EFEFEF",
        "fg": "#1155CC",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Dividend Payout Ratio = (Dividends Paid / Net Income) x 100"
      },
      "B13": {
        "v": "33.16%",
        "gf": "(SUBSTITUTE(index(importhtml(\"http://finviz.com/quote.ashx?t=\"&B2,\"table\",9),12,2),\"*\",\"\"",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C13": {
        "bd": true
      },
      "A14": {
        "v": "CASH Dividend Payout Ratio",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Cash Dividend Payout Ratio = Dividends paid / Free Cash Flow x 100\n\nПоказва ни по-истинското Payout Ratio и ни касае пряко като дивидентни инвеститори."
      },
      "B14": {
        "v": "N/A",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C14": {
        "bd": true
      },
      "A15": {
        "v": "Dividend Growth Rate 5 - 10 year avg",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B15": {
        "v": "N/A",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C15": {
        "v": "N/A",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "E15": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "F15": {
        "bd": true
      },
      "A16": {
        "v": "5 yrs Annualized ROI",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B16": {
        "v": "#REF!",
        "f": "Overview!J19",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "C16": {
        "bd": true
      },
      "E16": {
        "v": "Amount Invested",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F16": {
        "v": 987.0,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "A17": {
        "v": "10 yrs Annualized ROI",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B17": {
        "v": "#REF!",
        "f": "Overview!J29",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "C17": {
        "bd": true
      },
      "E17": {
        "v": "Amount Returned",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F17": {
        "v": 5062.0,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "A18": {
        "v": "Shares Outstanding",
        "fg": "#1155CC",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B18": {
        "v": "#REF!",
        "f": "Overview!C18",
        "gf": "GOOGLEFINANCE(B2,\"shares\"",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "C18": {
        "bd": true
      },
      "E18": {
        "v": "Years",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F18": {
        "v": 10,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "A19": {
        "v": "Revenue",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B19": {
        "v": 1159897000.0,
        "bg": "#F3F3F3",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "C19": {
        "bd": true
      },
      "E19": {
        "fg": "#000000",
        "bd": true
      },
      "F19": {
        "fg": "#000000",
        "bd": true
      },
      "A20": {
        "v": "Revenue avg increase 3 - 5 yrs",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B20": {
        "bg": "#FF0000",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C20": {
        "bg": "#FF0000",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "E20": {
        "v": "ROI",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F20": {
        "v": 4.128672746,
        "f": "(F17 - F16) / F16",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A21": {
        "v": "Gross Profit Margin",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Gross Profit Margin = (Gross Profit / Total Revenue) x 100 (%)\n\nПоказва ни какъв процент от оборота представлява брутната печалба. \n\nКолкото повече, толкова по-добре."
      },
      "B21": {
        "v": 0.1,
        "bg": "#FF0000",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C21": {
        "bd": true
      },
      "E21": {
        "v": "Annualized ROI",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F21": {
        "v": 0.1776073261,
        "f": "((1+(F17-F16)/F16)^(1/F18)-1)",
        "fg": "#FF0000",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A22": {
        "v": "Research & Development (R&D Ratio)",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Yoan Zografov:\nR&D ratio = R&D Expenses / Revenue х 100 (под 30%)\n\nПоказва ни какъв процент от оборота е разходът за проучване и развитие."
      },
      "B22": {
        "bg": "#00B050",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C22": {
        "bd": true
      },
      "E22": {
        "v": "Gain",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F22": {
        "v": 4075.0,
        "f": "F17-F16",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "A23": {
        "v": "Selling, General & Admin (SG&A Ratio)",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "SGA ratio = SG&A Expenses / Revenue х 100 (под 30%)\nПоказва ни какъв процент от оборота е този разход.\nРазходи за Заплати, Маркетинг, Реклама"
      },
      "B23": {
        "bg": "#6AA84F",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C23": {
        "bd": true
      },
      "A24": {
        "v": "EPS - Earnings Per Share",
        "fg": "#1155CC",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "EPS - Earnings per share. \nПечалба на дял: EPS = Net Income/ Shares outstanding\n\nПечалбата на акция или EPS е просто изчисление, което показва колко печалба може да генерира една компания на акция от своите акци.\n\nДва основни фактора влияят на EPS: печалбата и броят на акциите.\n\nПечалби: EPS на компанията ще се увеличи с нарастването на приходите. Това може да се случи поради фактори като ръст на продажбите или намаляване на разходите. Ако печалбите намалеят, EPS също ще намалее.\nАкции: EPS на компанията ще се увеличи, когато общият брой на акциите в обращение намалява, като например в случай на обратно изкупуване на акции. Той ще намалее, когато броят на акциите се увеличи, например ако компанията издаде нови акции.\n\nАко една компания заеме повече дълг, EPS (знаменателят) намалява от по-високите разходи за лихви . Степента на въздействие върху цената на акциите до голяма степен зависи от това как се използва дългът.\n\nНапример повишеният риск и разходите за лихви могат да доведат до намаляване на съотношението цена/печалба, докато добре структурираната реинвестиция за растеж може да доведе до увеличаване на съотношението P/E и да компенсира недостатъците от използването на дълг.\n\nАко има две идентични компании, инвеститорите са по-склонни да оценят компанията с висок ливъридж при по-ниско съотношение P/E, предвид по-високите рискове, свързани с ливъриджа.\n\nhttps://www.wallstreetprep.com/knowledge/pe-ratio-price-to-earnings/"
      },
      "B24": {
        "bg": "#FDE49A",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "C24": {
        "bd": true
      },
      "A25": {
        "v": "EPS Growth 5 - 10 yrs",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B25": {
        "bg": "#00B050",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C25": {
        "bg": "#FF0000",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A26": {
        "v": "Net Income",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Net Income = Revenue - All Expenses\nНетни приходи = Приходи - Всички разходи\n\nНетният доход е счетоводната печалба на компанията след изваждане на всички разходи и разходи от приходите. Нарича се още печалби."
      },
      "B26": {
        "v": 7457000000.0,
        "bg": "#FFD966",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "C26": {
        "bd": true
      },
      "A27": {
        "v": "Net Profit Margin",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "NET PROFIT MARGIN = NET INCOME / REVENUE x 100\nПоказва ни какъв процент от оборота представлява чистата печалба. Колкото повече, толкова по-добре.\nЗа предпочитане е над 20%"
      },
      "B27": {
        "bg": "#FCD668",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C27": {
        "bd": true
      },
      "A28": {
        "v": "Return on Equity (ROE)",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "ROE = (Net Income / Average Shareholders' Equity) * 100%\nПоказва ни как компанията използва капитала инвестиран от акционерите, как го оползотворява. Търсим стойности над 15%.\n\nИнвеститорите могат да анализират възвръщаемостта на собствения капитал, за да оценят способността на компанията да реализира печалба. Като цяло по-високата възвръщаемост на собствения капитал означава, че компанията е по-ефективна при генерирането на печалби.\n\nКазано с прости думи, ROE ви казва колко ефективно една компания използва своите нетни активи, за да генерира печалби. Високата възвръщаемост на собствения капитал означава, че една компания е добра в генерирането на печалби, които след това могат да бъдат използвани за увеличаване на приходите в бъдеще.\n\nhttps://stockanalysis.com/term/roe-return-on-equity/"
      },
      "B28": {
        "v": -0.0613,
        "bg": "#FCD668",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C28": {
        "bd": true
      },
      "A29": {
        "v": "Return on Assets (ROA)",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "ROA = (Net Income / Average Total Assets) * 100%\n\nПоказва ни как компанията използва активите си за генериране на печалби, как ги оползотворява. Търсим стойности над 5%."
      },
      "B29": {
        "v": 0.0156,
        "bg": "#FCD668",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C29": {
        "bd": true
      },
      "A30": {
        "v": "Return on Capital (ROIC)",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "ROIC = (EBIT / Average Invested Capital) * 100%\nВъзвръщаемостта на инвестирания капитал (ROIC) измерва доколко една компания е ефективна при инвестирането на своя капитал с цел увеличаване на печалбите. Изчислява се като EBIT (печалба преди лихви и данъци) се раздели на средния инвестиран капитал през предходната година.\n\nТърсим стойности над 15%\n\nROIC СТтойност - Интерпретация\n< 5% Слабо управление на капитала\n5% – 10% Приемливо, но посредствено\n> 10% Много добро – компанията създава стойност\n> 15% Отлично – вероятно има силно конкурентно предимство (moat)"
      },
      "B30": {
        "v": 0.3843,
        "bg": "#FCD668",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C30": {
        "bd": true
      },
      "A31": {
        "v": "Current Ratio",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "CURRENT RATIO = CURRENT ASSETS / CURRENT LIABILITIES (над 1 е ок)\nПоказва ни дали компанията може да погаси текущите си задължения с текущите си активи.\n\n================\nТекущият коефициент се използва за измерване на краткосрочната ликвидност на компанията. Ниско число може да показва, че дадена компания ще има проблеми с плащането на предстоящите си задължения.\n\nДоброто текущо съотношение е между 1,2 към 2 , което означава, че бизнесът има 2 пъти повече текущи активи, отколкото пасиви, за да покрие дълговете си. Текущо съотношение под 1 означава, че компанията няма достатъчно ликвидни активи, за да покрие своите краткосрочни задължения\n\nКакво е „добро“ Current Ratio?\n1.5 – 3.0: Това обикновено се счита за здравословен (добър) диапазон. Показва, че фирмата може да покрива задълженията си и има известен буфер.\n\nПод 1.0: Потенциален риск от ликвидни затруднения – фирмата няма достатъчно краткосрочни активи, за да плати краткосрочните си задължения.\n\nНад 3.0: Може да е знак, че капиталът не се използва ефективно – прекалено много пари са задържани в активи вместо да се инвестират.\n\nКонтекстът има значение:\nСектор: Търговски компании често имат по-нисък Current Ratio, докато производствени или технологични компании могат да поддържат по-висок.\n\nСезонност: Някои фирми имат сезонно колебание на оборотни активи и пасиви.\n\nИскаш ли да проверим какъв е текущият коефициент на определена компания?"
      },
      "B31": {
        "v": 0.76,
        "bg": "#FCD668",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "C31": {
        "bd": true
      },
      "A32": {
        "v": "Long - Term Debt",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B32": {
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "C32": {
        "bd": true
      },
      "A33": {
        "v": "Avg Debt Increase 10 yrs",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B33": {
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C33": {
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A34": {
        "v": "Long-term Debt to Equity Ratio",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B34": {
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "C34": {
        "bd": true
      },
      "A35": {
        "v": "Debt to Equity Ratio",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Debt to Equity Ratio = Total Debt / Total Equity\n\nDebt / Equity Ratio = Total Debt / Shareholders' Equity\n\nПОД 2 Е ОК\n\nDebt to Equity Ratio: Съотношението дълг към собствен капитал изчислява тежестта на общия дълг и финансови пасиви спрямо собствения капитал или с други думи показва как компанията финансира бизнес операциите си - повече чрез дълг или акционерен капитал. Препоръчителни са стойности под 2.\n\nНякои инвеститори също обичат да сравняват съотношението D/E на компанията с общото \nD/E на S&P 500, което беше приблизително 1,58 в края на 202"
      },
      "B35": {
        "bg": "#FCD668",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "C35": {
        "bd": true
      },
      "A36": {
        "v": "Cash Flow from Operations",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B36": {
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "C36": {
        "bd": true
      },
      "A37": {
        "v": "CFFO 5-10 Years increase",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B37": {
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C37": {
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A38": {
        "v": "Free Cash Flow",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B38": {
        "v": 14402000000.0,
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "C38": {
        "bd": true
      },
      "A39": {
        "v": "FCF 5 - 10 years avg increase",
        "bg": "#EFEFEF",
        "fg": "#000000",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B39": {
        "bg": "#00B050",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C39": {
        "bg": "#00B050",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A40": {
        "v": "Cash Flow Margin",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Cash Flow Margin Ratio = Cash Flow From Operations / Revenue x 100 (%)\nПоказва ни колко от всеки долар продажба се задържа като пари в брой (КЕШ). Колкото повече, толкова по-добре."
      },
      "B40": {
        "v": 0.0,
        "f": "B36/B19",
        "bg": "#00B050",
        "fg": "#000000",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C40": {
        "bd": true
      },
      "A41": {
        "v": "Free Cash Flow Margin",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Free Cash Flow Margin = Free Cash Flow / Revenue x 100 (%)\n\nМаржът на свободния паричен поток (марж на FCF) е финансов показател, който показва колко ефективно една компания преобразува приходите си в свободен паричен поток, който представлява паричните средства, генерирани от компанията след покриване на оперативните разходи и капиталовите разходи. Той по същество измерва каква част от продажбите на компанията са налични като парични средства за дейности като изплащане на дълг, инвестиции или дивиденти. \n\nПо-високият марж на свободния финансов поток (FCF) показва, че компанията е по-ефективна в превръщането на продажбите в пари в брой, което може да бъде положителен знак за финансово здраве и оперативна ефективност. Марж на FCF от 10-15% често се счита за.\n\nВисокият марж на свободния финансов поток предполага ефективно управление на разходите и ефикасно използване на капитала."
      },
      "B41": {
        "v": 12.41661975,
        "f": "(B38/B19)",
        "bg": "#00B050",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C41": {
        "bd": true
      },
      "A42": {
        "v": "Free Cash Flow Yield",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Free Cash Flow Yield = Free Cash Flow / Market Cap x 100 (%)\n\nFree Cash Flow Yield (FCF Yield) е финансов показател, който показва колко свободен паричен поток (FCF) генерира една компания спрямо пазарната ѝ стойност. Това е мярка за доходността на инвестицията, базирана на реалния паричен поток, който остава на разположение за инвеститорите, след като всички оперативни и капиталови разходи са покрити.\n\nКакво ни казва този показател:\nВисок FCF Yield (напр. 8–10%+) → компанията генерира много свободен паричен поток спрямо текущата си пазарна оценка → потенциално подценена или много ефективна.\n\nНисък FCF Yield (напр. под 3%) → или е надценена, или не генерира достатъчно свободен паричен поток → възможен сигнал за рискове или слабости."
      },
      "B42": {
        "v": "#REF!",
        "f": "1*(B38/B9)",
        "bg": "#00B050",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C42": {
        "bd": true
      },
      "A43": {
        "v": "Earnings Yield",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Earnings Yield = EPS / Price x 100 (%)\nEarnings Yield (EY) е финансов показател, който показва каква печалба на акция (EPS) се получава спрямо цената на акцията. Тоест, измерва колко „печалба“ получаваш за всеки вложен лев в акция.\n\nВисока стойност на EY → компанията генерира много печалба спрямо цената си → потенциално подценена.\nНиска стойност на EY → или е надценена, или има ниска печалба спрямо цената си.\nТова е обратното на P/E (Price-to-Earnings) ratio:\n\nEarnings Yield Интерпретация\n> 10% Много високо – потенциално подценена акция (или с временни проблеми)\n7–10% Добро ниво – може да бъде разумна стойностна инвестиция\n4–7% Нормално ниво за зрели компании със стабилни приходи\n< 4% Ниско – потенциално надценена акция или висок растеж, но с риск\n\nВажно:\nEarnings Yield сам по себе си НЕ е достатъчен.\n\nТрябва да го сравняваш с:\nЛихвения процент на безрисков актив – напр. доходността по 10-годишни държавни облигации.\nАко Earnings Yield е значително над тях (напр. 10% vs. 3%), това е добър знак.\n\n- Ръст на печалбите (EPS Growth) – висока печалба с бавен растеж ≠ добра инвестиция.\n\n- Качество на печалбата – дали е устойчива или манипулирана чрез счетоводни трикове.\n\n- Сравнение със сектора – EY от 5% може да е отлично за tech, но ниско за енергийна компания."
      },
      "B43": {
        "v": "#REF!",
        "f": "B24/B7",
        "bg": "#00B050",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C43": {
        "bd": true
      },
      "A44": {
        "v": "Free Cash Flow  / Net Income",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Съотношението Свободен паричен поток към нетен доход (Free Cash Flow to Net Income ratio, FCF/NI) \nПоказва колко от отчетената печалба на една компания реално се превръща в „твърди“ пари, които остават след всички разходи и могат да се използват за: инвестиции, изплащане на дълг или дивиденти.\n\nПрагове:\nНад 100% → отлично, реалният кеш надвишава печалбата.\n\nОколо 100% → здравословно.\n\nПод 100% → внимателно, особено ако е трайно под 70%.\n\nОтрицателно → нетен доход положителен, но FCF отрицателен → червен флаг."
      },
      "B44": {
        "v": 1.931339681,
        "f": "B38/B26",
        "bg": "#00B050",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "C44": {
        "bd": true
      },
      "A45": {
        "v": "Cash Flow Coverage Ratio",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Cash Flow Coverage Ratio = Operating Cash flow / Long-Term Debt\n\nВисока стойност на това ratio показва, че компанията може да обслужва дълга си. Колкото по-високо CFCR над 1, толкова по-добре."
      },
      "B45": {
        "bg": "#F3F3F3",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "C45": {
        "bd": true
      },
      "A46": {
        "v": "Operating Cash Flow Ratio",
        "fg": "#000000",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "cm": "Yoan Zografov:\n\nOperating Cash Flow Ratio = Operating Cash Flow / Current Liabilities\n\nТова е мярка за броя пъти, кога една компания може да изплати текущи задължения с паричните средства, генерирани за даден период."
      },
      "B46": {
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "C46": {
        "bd": true
      },
      "A47": {
        "v": "Cash ROA",
        "bg": "#EFEFEF",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B47": {
        "bg": "#F3F3F3",
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "C47": {
        "bd": true
      },
      "A48": {
        "v": "DCF Model",
        "bg": "#8DB5F8",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B48": {
        "v": "#REF!",
        "f": "'DCF 10 years'!H26",
        "bg": "#8DB5F8",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "C48": {
        "bd": true
      },
      "D48": {
        "v": 0.3,
        "bg": "#8DB5F8",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A49": {
        "v": "FCF Multiple",
        "bg": "#FFD966",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B49": {
        "v": "#REF!",
        "f": "'FCF Multiple'!H35",
        "bg": "#FFD966",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "C49": {
        "bd": true
      },
      "D49": {
        "v": 0.3,
        "bg": "#FFD966",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A50": {
        "v": "EV/EBITDA Model",
        "bg": "#8DB5F8",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B50": {
        "v": "#REF!",
        "f": "'EV/EBITDA'!H26",
        "bg": "#8DB5F8",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "C50": {
        "bd": true
      },
      "D50": {
        "v": 0.2,
        "bg": "#8DB5F8",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A51": {
        "v": "P/E Model",
        "bg": "#FFD966",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B51": {
        "v": "#REF!",
        "f": "'P/E '!H26",
        "bg": "#FFD966",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "C51": {
        "bd": true
      },
      "D51": {
        "v": 0.2,
        "bg": "#8DB5F8",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A52": {
        "v": "Dividend Model",
        "bg": "#8DB5F8",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B52": {
        "v": "#REF!",
        "f": "Dividends!H26",
        "bg": "#8DB5F8",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "C52": {
        "bd": true
      },
      "D52": {
        "v": 0.0,
        "bg": "#FCD668",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A53": {
        "v": "Multiple",
        "bg": "#FFD966",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B53": {
        "v": 0.0,
        "bg": "#FFD966",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "C53": {
        "bd": true
      },
      "D53": {
        "v": 0.0,
        "bg": "#8DB5F8",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A54": {
        "v": "Average",
        "bg": "#7AD592",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true
      },
      "B54": {
        "v": "#REF!",
        "f": "SUM(B55:C59)",
        "bg": "#EAD1DC",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency0",
        "cm": "💡 Най-простото правило\n\n👉 “Колкото по-голям е спадът от твоята оценка → толкова по-добра сделка"
      },
      "C54": {
        "bd": true
      },
      "D54": {
        "v": 1.0,
        "f": "sum(D48:D53)",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "B55": {
        "v": "#REF!",
        "f": "B48*D48",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "C55": {
        "bd": true
      },
      "B56": {
        "v": "#REF!",
        "f": "B49*D49",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "C56": {
        "bd": true
      },
      "B57": {
        "v": "#REF!",
        "f": "B50*D50",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "C57": {
        "bd": true
      },
      "B58": {
        "v": "#REF!",
        "f": "B51*D51",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "C58": {
        "bd": true
      },
      "B59": {
        "v": 0.0,
        "f": "B53*D53",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "C59": {
        "bd": true
      },
      "B60": {
        "v": "#REF!",
        "f": "SUM(B55:B59)",
        "bg": "#FCD668",
        "sz": 11.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "C60": {
        "bd": true
      }
    }
  },
  {
    "id": "dcf10",
    "title": "DCF 10 years",
    "maxCol": 31,
    "maxRow": 42,
    "colWidths": {
      "1": 142,
      "2": 107,
      "3": 24,
      "4": 113,
      "5": 95,
      "6": 95,
      "7": 95,
      "8": 95,
      "9": 95,
      "10": 95,
      "11": 95,
      "12": 95,
      "13": 95,
      "14": 95,
      "15": 113,
      "16": 24,
      "17": 111,
      "18": 111,
      "19": 24,
      "20": 85,
      "21": 85,
      "22": 85,
      "23": 85,
      "24": 85,
      "25": 85,
      "26": 85,
      "27": 85,
      "28": 85,
      "29": 85,
      "30": 85,
      "31": 85
    },
    "merges": [
      {
        "ref": "F1:J1",
        "r1": 1,
        "c1": 6,
        "r2": 1,
        "c2": 10
      },
      {
        "ref": "A4:B4",
        "r1": 4,
        "c1": 1,
        "r2": 4,
        "c2": 2
      },
      {
        "ref": "Q4:R4",
        "r1": 4,
        "c1": 17,
        "r2": 4,
        "c2": 18
      },
      {
        "ref": "T4:AE4",
        "r1": 4,
        "c1": 20,
        "r2": 4,
        "c2": 31
      },
      {
        "ref": "Q8:R8",
        "r1": 8,
        "c1": 17,
        "r2": 8,
        "c2": 18
      },
      {
        "ref": "F9:G9",
        "r1": 9,
        "c1": 6,
        "r2": 9,
        "c2": 7
      },
      {
        "ref": "A11:B11",
        "r1": 11,
        "c1": 1,
        "r2": 11,
        "c2": 2
      },
      {
        "ref": "T10:U10",
        "r1": 10,
        "c1": 20,
        "r2": 10,
        "c2": 21
      },
      {
        "ref": "T11:U11",
        "r1": 11,
        "c1": 20,
        "r2": 11,
        "c2": 21
      },
      {
        "ref": "Q14:R14",
        "r1": 14,
        "c1": 17,
        "r2": 14,
        "c2": 18
      },
      {
        "ref": "T14:AE14",
        "r1": 14,
        "c1": 20,
        "r2": 14,
        "c2": 31
      },
      {
        "ref": "F16:G16",
        "r1": 16,
        "c1": 6,
        "r2": 16,
        "c2": 7
      },
      {
        "ref": "A18:B18",
        "r1": 18,
        "c1": 1,
        "r2": 18,
        "c2": 2
      },
      {
        "ref": "Q18:R18",
        "r1": 18,
        "c1": 17,
        "r2": 18,
        "c2": 18
      },
      {
        "ref": "H30:I31",
        "r1": 30,
        "c1": 8,
        "r2": 31,
        "c2": 9
      },
      {
        "ref": "D33:L33",
        "r1": 33,
        "c1": 4,
        "r2": 33,
        "c2": 12
      },
      {
        "ref": "E34:F34",
        "r1": 34,
        "c1": 5,
        "r2": 34,
        "c2": 6
      },
      {
        "ref": "H36:I36",
        "r1": 36,
        "c1": 8,
        "r2": 36,
        "c2": 9
      },
      {
        "ref": "H37:I39",
        "r1": 37,
        "c1": 8,
        "r2": 39,
        "c2": 9
      },
      {
        "ref": "K37:L39",
        "r1": 37,
        "c1": 11,
        "r2": 39,
        "c2": 12
      },
      {
        "ref": "F41:G42",
        "r1": 41,
        "c1": 6,
        "r2": 42,
        "c2": 7
      },
      {
        "ref": "H41:I42",
        "r1": 41,
        "c1": 8,
        "r2": 42,
        "c2": 9
      },
      {
        "ref": "T20:U20",
        "r1": 20,
        "c1": 20,
        "r2": 20,
        "c2": 21
      },
      {
        "ref": "T21:U21",
        "r1": 21,
        "c1": 20,
        "r2": 21,
        "c2": 21
      },
      {
        "ref": "F23:G23",
        "r1": 23,
        "c1": 6,
        "r2": 23,
        "c2": 7
      },
      {
        "ref": "H25:I25",
        "r1": 25,
        "c1": 8,
        "r2": 25,
        "c2": 9
      },
      {
        "ref": "H26:I28",
        "r1": 26,
        "c1": 8,
        "r2": 28,
        "c2": 9
      },
      {
        "ref": "K26:L28",
        "r1": 26,
        "c1": 11,
        "r2": 28,
        "c2": 12
      },
      {
        "ref": "F30:G31",
        "r1": 30,
        "c1": 6,
        "r2": 31,
        "c2": 7
      }
    ],
    "cells": {
      "A1": {
        "v": "Company ",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B1": {
        "v": "#REF!",
        "f": "Overview!B5",
        "bg": "#93C47D",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D1": {
        "v": "Market Price",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E1": {
        "v": "#REF!",
        "f": "Overview!B14",
        "gf": "GOOGLEFINANCE(B1)",
        "bg": "#93C47D",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F1": {
        "v": "* Въвеждайте стойности само в жълтите полета",
        "fg": "#F1C232",
        "b": true,
        "al": "center"
      },
      "K1": {
        "v": "Data",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "L1": {
        "v": "#REF!",
        "f": "Overview!G6",
        "bg": "#93C47D",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "date"
      },
      "A2": {
        "v": "Shares Outstanding",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B2": {
        "v": 383573,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "integer"
      },
      "A4": {
        "v": "Optimistic Scenario",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B4": {
        "bd": true
      },
      "D4": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E4": {
        "v": 2027,
        "f": "D4+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F4": {
        "v": 2028,
        "f": "E4+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G4": {
        "v": 2029,
        "f": "F4+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H4": {
        "v": 2030,
        "f": "G4+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I4": {
        "v": 2031,
        "f": "H4+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J4": {
        "v": 2032,
        "f": "I4+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K4": {
        "v": 2033,
        "f": "J4+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L4": {
        "v": 2034,
        "f": "K4+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M4": {
        "v": 2035,
        "f": "L4+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N4": {
        "v": 2036,
        "f": "M4+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O4": {
        "v": "Terminal Value",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "Q4": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R4": {
        "bd": true
      },
      "T4": {
        "v": "10 Years FCF",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "U4": {
        "bd": true
      },
      "V4": {
        "bd": true
      },
      "W4": {
        "bd": true
      },
      "X4": {
        "bd": true
      },
      "Y4": {
        "bd": true
      },
      "Z4": {
        "bd": true
      },
      "AA4": {
        "bd": true
      },
      "AB4": {
        "bd": true
      },
      "AC4": {
        "bd": true
      },
      "AD4": {
        "bd": true
      },
      "AE4": {
        "bd": true
      },
      "A5": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B5": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D5": {
        "v": 4283000,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "integer",
        "cm": "Тук въвеждаме последния Free Cash Flow, който имаме за компанията или средния за 10 годишен или 5 годишен период. \nВзимаме средния FCF като го сметнем с таблицата на Stock Valuation tab-а. \nНамираме историята на FCF в macrotrends чрез търсене в Google, копираме данните за последните 10 години и ги paste-ваме в Stock Valuation tab-а. \nАко искаме да вземем последния FCF, намираме го от yahoo finance Financial таба за съответната компания и след това отиваме на Cash Flow Statement и най-долу взимаме стойността на Free Cash Flow TTM."
      },
      "E5": {
        "v": 4711300.0,
        "f": "D5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F5": {
        "v": 5182430.0,
        "f": "E5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G5": {
        "v": 5700673.0,
        "f": "F5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H5": {
        "v": 6270740.3,
        "f": "G5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I5": {
        "v": 6897814.33,
        "f": "H5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J5": {
        "v": 7587595.763,
        "f": "I5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K5": {
        "v": 8346355.339,
        "f": "J5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L5": {
        "v": 9180990.873,
        "f": "K5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M5": {
        "v": 10099089.96,
        "f": "L5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N5": {
        "v": 11108998.96,
        "f": "M5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O5": {
        "v": 11108998.96,
        "f": "N5",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q5": {
        "v": "Amount Invested",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R5": {
        "v": 1425000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "T5": {
        "v": "Year 0",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "U5": {
        "v": "Year 1",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "V5": {
        "v": "Year 2",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "W5": {
        "v": "Year 3",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "X5": {
        "v": "Year 4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Y5": {
        "v": "Year 5",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Z5": {
        "v": "Year 6",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AA5": {
        "v": "Year 7",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AB5": {
        "v": "Year 8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AC5": {
        "v": "Year 9",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AD5": {
        "v": "Year 10",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AE5": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "A6": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B6": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D6": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O6": {
        "v": 163460984.6,
        "f": "O5*(1+B8)/(B5-B8)",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q6": {
        "v": "Amount Returned",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R6": {
        "v": 2790000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "T6": {
        "v": 2016,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "U6": {
        "v": 2017,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "V6": {
        "v": 2018,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "W6": {
        "v": 2019,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "X6": {
        "v": 2020,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Y6": {
        "v": 2021,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Z6": {
        "v": 2022,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AA6": {
        "v": 2023,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AB6": {
        "v": 2024,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AC6": {
        "v": 2025,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AD6": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AE6": {
        "v": "Average",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "A7": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B7": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D7": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E7": {
        "v": 4283000.0,
        "f": "E5/(1+$B$5)^1",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F7": {
        "v": 4283000.0,
        "f": "F5/(1+$B$5)^2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G7": {
        "v": 4283000.0,
        "f": "G5/(1+$B$5)^3",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H7": {
        "v": 4283000.0,
        "f": "H5/(1+$B$5)^4",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I7": {
        "v": 4283000.0,
        "f": "I5/(1+$B$5)^5",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J7": {
        "v": 4283000.0,
        "f": "J5/(1+$B$5)^6",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K7": {
        "v": 4283000.0,
        "f": "K5/(1+$B$5)^7",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L7": {
        "v": 4283000.0,
        "f": "L5/(1+$B$5)^8",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M7": {
        "v": 4283000.0,
        "f": "M5/(1+$B$5)^9",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N7": {
        "v": 4283000.0,
        "f": "N5/(1+$B$5)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O7": {
        "v": 63021285.71,
        "f": "O6/(1+$B$5)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q7": {
        "v": "Years",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R7": {
        "v": 5,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "T7": {
        "v": 711000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "U7": {
        "v": 1425000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "V7": {
        "v": 961000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "W7": {
        "v": 2038000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "X7": {
        "v": 1542000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "Y7": {
        "v": 2790000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "Z7": {
        "v": 2738000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AA7": {
        "v": 2036000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AB7": {
        "v": 3136000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AC7": {
        "v": 3487000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AD7": {
        "v": 4283000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AE7": {
        "v": 2286090.909,
        "f": "AVERAGE(T7:AD7)",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "A8": {
        "v": "Perpetual Growth",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B8": {
        "v": 0.03,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D8": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "O8": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Q8": {
        "fg": "#000000",
        "bd": true
      },
      "R8": {
        "bd": true
      },
      "T8": {
        "bd": true
      },
      "U8": {
        "v": 1.004219409,
        "f": "IF(OR(T7=\"\", T7=0, U7=\"\"), \"\", (U7-T7)/ABS(T7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "V8": {
        "v": -0.3256140351,
        "f": "IF(OR(U7=\"\", U7=0, V7=\"\"), \"\", (V7-U7)/ABS(U7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "W8": {
        "v": 1.120707596,
        "f": "IF(OR(V7=\"\", V7=0, W7=\"\"), \"\", (W7-V7)/ABS(V7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "X8": {
        "v": -0.2433758587,
        "f": "IF(OR(W7=\"\", W7=0, X7=\"\"), \"\", (X7-W7)/ABS(W7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Y8": {
        "v": 0.8093385214,
        "f": "IF(OR(X7=\"\", X7=0, Y7=\"\"), \"\", (Y7-X7)/ABS(X7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Z8": {
        "v": -0.01863799283,
        "f": "IF(OR(Y7=\"\", Y7=0, Z7=\"\"), \"\", (Z7-Y7)/ABS(Y7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AA8": {
        "v": -0.2563915267,
        "f": "IF(OR(Z7=\"\", Z7=0, AA7=\"\"), \"\", (AA7-Z7)/ABS(Z7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AB8": {
        "v": 0.5402750491,
        "f": "IF(OR(AA7=\"\", AA7=0, AB7=\"\"), \"\", (AB7-AA7)/ABS(AA7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AC8": {
        "v": 0.1119260204,
        "f": "IF(OR(AB7=\"\", AB7=0, AC7=\"\"), \"\", (AC7-AB7)/ABS(AB7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AD8": {
        "v": 0.2282764554,
        "f": "IF(OR(AC7=\"\", AC7=0, AD7=\"\"), \"\", (AD7-AC7)/ABS(AC7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AE8": {
        "v": 0.2970723639,
        "f": "IFERROR(AVERAGE(U8:AD8), 0)",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A9": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B9": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D9": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E9": {
        "v": 105851285.7,
        "f": "SUM(E7:O7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F9": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G9": {
        "bd": true
      },
      "H9": {
        "v": 248.3651277,
        "f": "(E9/B2)*(1-B9)",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I9": {
        "fg": "#000000",
        "bd": true
      },
      "J9": {
        "fg": "#000000",
        "bd": true
      },
      "K9": {
        "fg": "#000000",
        "bd": true
      },
      "L9": {
        "fg": "#000000",
        "bd": true
      },
      "M9": {
        "fg": "#000000",
        "bd": true
      },
      "N9": {
        "fg": "#000000",
        "bd": true
      },
      "O9": {
        "fg": "#000000",
        "bd": true
      },
      "Q9": {
        "v": "ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R9": {
        "v": 0.9578947368,
        "f": "(R6 - R5) / R5",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Q10": {
        "v": "Annualized ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R10": {
        "v": 0.1438204787,
        "f": "((1+(R6-R5)/R5)^(1/R7)-1)",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "T10": {
        "v": "Annual Growth Rate",
        "bg": "#D5A6BD",
        "fg": "#000000",
        "b": true,
        "bd": true
      },
      "U10": {
        "bd": true
      },
      "V10": {
        "v": 0.2970723639,
        "f": "IFERROR(AE8, 0)",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A11": {
        "v": "Average Scenario",
        "bg": "#4A86E8",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B11": {
        "bd": true
      },
      "D11": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E11": {
        "v": 2027,
        "f": "D11+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F11": {
        "v": 2028,
        "f": "E11+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G11": {
        "v": 2029,
        "f": "F11+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H11": {
        "v": 2030,
        "f": "G11+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I11": {
        "v": 2031,
        "f": "H11+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J11": {
        "v": 2032,
        "f": "I11+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K11": {
        "v": 2033,
        "f": "J11+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L11": {
        "v": 2034,
        "f": "K11+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M11": {
        "v": 2035,
        "f": "L11+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N11": {
        "v": 2036,
        "f": "M11+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O11": {
        "v": "Terminal Value",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "Q11": {
        "v": "Gain",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R11": {
        "v": 1365000.0,
        "f": "R6-R5",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "T11": {
        "v": "CAGR",
        "bg": "#D5A6BD",
        "fg": "#000000",
        "b": true,
        "bd": true
      },
      "U11": {
        "bd": true
      },
      "V11": {
        "v": 0.196707044,
        "f": "CAGR(T7:AD7)",
        "bg": "#F9F9FF",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A12": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B12": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D12": {
        "v": 4283000,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "integer",
        "cm": "Тук въвеждаме последния Free Cash Flow, който имаме за компанията или средния за 10 годишен или 5 годишен период. \nВзимаме средния FCF като го сметнем с таблицата на Stock Valuation tab-а. \nНамираме историята на FCF в macrotrends чрез търсене в Google, копираме данните за последните 10 години и ги paste-ваме в Stock Valuation tab-а. \nАко искаме да вземем последния FCF, намираме го от yahoo finance Financial таба за съответната компания и след това отиваме на Cash Flow Statement и най-долу взимаме стойността на Free Cash Flow TTM."
      },
      "E12": {
        "v": 4497150.0,
        "f": "D12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F12": {
        "v": 4722007.5,
        "f": "E12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G12": {
        "v": 4958107.875,
        "f": "F12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H12": {
        "v": 5206013.269,
        "f": "G12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I12": {
        "v": 5466313.932,
        "f": "H12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J12": {
        "v": 5739629.629,
        "f": "I12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K12": {
        "v": 6026611.11,
        "f": "J12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L12": {
        "v": 6327941.666,
        "f": "K12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M12": {
        "v": 6644338.749,
        "f": "L12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N12": {
        "v": 6976555.686,
        "f": "M12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O12": {
        "v": 6976555.686,
        "f": "N12",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "A13": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B13": {
        "v": 0.05,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D13": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O13": {
        "v": 102655033.7,
        "f": "O12*(1+B15)/(B12-B15)",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "A14": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B14": {
        "v": 0.05,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D14": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E14": {
        "v": 4088318.182,
        "f": "E12/(1+$B$12)^1",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F14": {
        "v": 3902485.537,
        "f": "F12/(1+$B$12)^2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G14": {
        "v": 3725099.831,
        "f": "G12/(1+$B$12)^3",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H14": {
        "v": 3555777.111,
        "f": "H12/(1+$B$12)^4",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I14": {
        "v": 3394150.879,
        "f": "I12/(1+$B$12)^5",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J14": {
        "v": 3239871.294,
        "f": "J12/(1+$B$12)^6",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K14": {
        "v": 3092604.417,
        "f": "K12/(1+$B$12)^7",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L14": {
        "v": 2952031.489,
        "f": "L12/(1+$B$12)^8",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M14": {
        "v": 2817848.239,
        "f": "M12/(1+$B$12)^9",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N14": {
        "v": 2689764.228,
        "f": "N12/(1+$B$12)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O14": {
        "v": 39577959.36,
        "f": "O13/(1+$B$12)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q14": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R14": {
        "bd": true
      },
      "T14": {
        "v": "10 Years REVENUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "U14": {
        "bd": true
      },
      "V14": {
        "bd": true
      },
      "W14": {
        "bd": true
      },
      "X14": {
        "bd": true
      },
      "Y14": {
        "bd": true
      },
      "Z14": {
        "bd": true
      },
      "AA14": {
        "bd": true
      },
      "AB14": {
        "bd": true
      },
      "AC14": {
        "bd": true
      },
      "AD14": {
        "bd": true
      },
      "AE14": {
        "bd": true
      },
      "A15": {
        "v": "Perpetual Growth",
        "bg": "#1155CC",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B15": {
        "v": 0.03,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D15": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "O15": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Q15": {
        "v": "Amount Invested",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R15": {
        "v": 1425000,
        "bg": "#FFD966",
        "fg": "#111827",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "T15": {
        "v": "Year 0",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "U15": {
        "v": "Year 1",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "V15": {
        "v": "Year 2",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "W15": {
        "v": "Year 3",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "X15": {
        "v": "Year 4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Y15": {
        "v": "Year 5",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Z15": {
        "v": "Year 6",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AA15": {
        "v": "Year 7",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AB15": {
        "v": "Year 8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AC15": {
        "v": "Year 9",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AD15": {
        "v": "Year 10",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AE15": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "A16": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B16": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D16": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E16": {
        "v": 73035910.57,
        "f": "SUM(E14:O14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F16": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G16": {
        "bd": true
      },
      "H16": {
        "v": 171.3684736,
        "f": "(E16/B2)*(1-B16)",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I16": {
        "fg": "#000000",
        "bd": true
      },
      "J16": {
        "fg": "#000000",
        "bd": true
      },
      "K16": {
        "fg": "#000000",
        "bd": true
      },
      "L16": {
        "fg": "#000000",
        "bd": true
      },
      "M16": {
        "fg": "#000000",
        "bd": true
      },
      "N16": {
        "fg": "#000000",
        "bd": true
      },
      "O16": {
        "fg": "#000000",
        "bd": true
      },
      "Q16": {
        "v": "Amount Returned",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R16": {
        "v": 4283000,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "T16": {
        "v": 2016,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "U16": {
        "v": 2017,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "V16": {
        "v": 2018,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "W16": {
        "v": 2019,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "X16": {
        "v": 2020,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Y16": {
        "v": 2021,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Z16": {
        "v": 2022,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AA16": {
        "v": 2023,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AB16": {
        "v": 2024,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AC16": {
        "v": 2025,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AD16": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AE16": {
        "v": "Average",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q17": {
        "v": "Years",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R17": {
        "v": 10,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "T17": {
        "v": 9946000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "U17": {
        "v": 11325000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "V17": {
        "v": 12444000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "W17": {
        "v": 13601000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "X17": {
        "v": 14884000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "Y17": {
        "v": 14351000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "Z17": {
        "v": 17108000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AA17": {
        "v": 18449000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AB17": {
        "v": 20498000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AC17": {
        "v": 22595000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AD17": {
        "v": 25116000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AE17": {
        "v": 16392454.55,
        "f": "AVERAGE(T17:AD17)",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "A18": {
        "v": "Worst Scenario",
        "bg": "#FF0000",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B18": {
        "bd": true
      },
      "D18": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E18": {
        "v": 2027,
        "f": "D18+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F18": {
        "v": 2028,
        "f": "E18+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G18": {
        "v": 2029,
        "f": "F18+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H18": {
        "v": 2030,
        "f": "G18+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I18": {
        "v": 2031,
        "f": "H18+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J18": {
        "v": 2032,
        "f": "I18+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K18": {
        "v": 2033,
        "f": "J18+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L18": {
        "v": 2034,
        "f": "K18+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M18": {
        "v": 2035,
        "f": "L18+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N18": {
        "v": 2036,
        "f": "M18+1",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O18": {
        "v": "Terminal Value",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "Q18": {
        "fg": "#000000",
        "bd": true
      },
      "R18": {
        "bd": true
      },
      "T18": {
        "bd": true
      },
      "U18": {
        "v": 0.138648703,
        "f": "IF(OR(T17=\"\", T17=0, U17=\"\"), \"\", (U17-T17)/ABS(T17))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "V18": {
        "v": 0.09880794702,
        "f": "IF(OR(U17=\"\", U17=0, V17=\"\"), \"\", (V17-U17)/ABS(U17))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "W18": {
        "v": 0.09297653488,
        "f": "IF(OR(V17=\"\", V17=0, W17=\"\"), \"\", (W17-V17)/ABS(V17))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "X18": {
        "v": 0.09433129917,
        "f": "IF(OR(W17=\"\", W17=0, X17=\"\"), \"\", (X17-W17)/ABS(W17))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Y18": {
        "v": -0.03581026606,
        "f": "IF(OR(X17=\"\", X17=0, Y17=\"\"), \"\", (Y17-X17)/ABS(X17))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Z18": {
        "v": 0.1921120479,
        "f": "IF(OR(Y17=\"\", Y17=0, Z17=\"\"), \"\", (Z17-Y17)/ABS(Y17))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AA18": {
        "v": 0.07838438158,
        "f": "IF(OR(Z17=\"\", Z17=0, AA17=\"\"), \"\", (AA17-Z17)/ABS(Z17))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AB18": {
        "v": 0.1110629302,
        "f": "IF(OR(AA17=\"\", AA17=0, AB17=\"\"), \"\", (AB17-AA17)/ABS(AA17))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AC18": {
        "v": 0.1023026637,
        "f": "IF(OR(AB17=\"\", AB17=0, AC17=\"\"), \"\", (AC17-AB17)/ABS(AB17))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AD18": {
        "v": 0.1115733569,
        "f": "IF(OR(AC17=\"\", AC17=0, AD17=\"\"), \"\", (AD17-AC17)/ABS(AC17))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AE18": {
        "v": 0.09843895984,
        "f": "IFERROR(AVERAGE(U18:AD18), 0)",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A19": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B19": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D19": {
        "v": 4283000,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "integer",
        "cm": "Тук въвеждаме последния Free Cash Flow, който имаме за компанията или средния за 10 годишен или 5 годишен период. \nВзимаме средния FCF като го сметнем с таблицата на Stock Valuation tab-а. \nНамираме историята на FCF в macrotrends чрез търсене в Google, копираме данните за последните 10 години и ги paste-ваме в Stock Valuation tab-а. \nАко искаме да вземем последния FCF, намираме го от yahoo finance Financial таба за съответната компания и след това отиваме на Cash Flow Statement и най-долу взимаме стойността на Free Cash Flow TTM."
      },
      "E19": {
        "v": 4411490.0,
        "f": "D19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F19": {
        "v": 4543834.7,
        "f": "E19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G19": {
        "v": 4680149.741,
        "f": "F19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H19": {
        "v": 4820554.233,
        "f": "G19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I19": {
        "v": 4965170.86,
        "f": "H19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J19": {
        "v": 5114125.986,
        "f": "I19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K19": {
        "v": 5267549.766,
        "f": "J19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L19": {
        "v": 5425576.259,
        "f": "K19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M19": {
        "v": 5588343.546,
        "f": "L19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N19": {
        "v": 5755993.853,
        "f": "M19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O19": {
        "v": 5755993.853,
        "f": "N19",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q19": {
        "v": "ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R19": {
        "v": 2.005614035,
        "f": "(R16 - R15) / R15",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A20": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B20": {
        "v": 0.03,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D20": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O20": {
        "v": 84695338.12,
        "f": "O19*(1+B22)/(B19-B22)",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q20": {
        "v": "Annualized ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R20": {
        "v": 0.1163318635,
        "f": "((1+(R16-R15)/R15)^(1/R17)-1)",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "T20": {
        "v": "Annual Growth Rate",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "bd": true
      },
      "U20": {
        "bd": true
      },
      "V20": {
        "v": 0.09843895984,
        "f": "IFERROR(AE18, 0)",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A21": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B21": {
        "v": 0.03,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D21": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E21": {
        "v": 4010445.455,
        "f": "E19/(1+$B$19)^1",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F21": {
        "v": 3755235.289,
        "f": "F19/(1+$B$19)^2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G21": {
        "v": 3516265.771,
        "f": "G19/(1+$B$19)^3",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H21": {
        "v": 3292503.404,
        "f": "H19/(1+$B$19)^4",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I21": {
        "v": 3082980.46,
        "f": "I19/(1+$B$19)^5",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J21": {
        "v": 2886790.794,
        "f": "J19/(1+$B$19)^6",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K21": {
        "v": 2703085.925,
        "f": "K19/(1+$B$19)^7",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L21": {
        "v": 2531071.367,
        "f": "L19/(1+$B$19)^8",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M21": {
        "v": 2370003.189,
        "f": "M19/(1+$B$19)^9",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N21": {
        "v": 2219184.804,
        "f": "N19/(1+$B$19)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O21": {
        "v": 32653719.26,
        "f": "O20/(1+$B$19)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q21": {
        "v": "Gain",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R21": {
        "v": 2858000.0,
        "f": "R16-R15",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "T21": {
        "v": "CAGR",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "bd": true
      },
      "U21": {
        "bd": true
      },
      "V21": {
        "v": 0.09705954897,
        "f": "CAGR(T17:AD17)",
        "bg": "#F9F9FF",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A22": {
        "v": "Perpetual Growth",
        "bg": "#1155CC",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B22": {
        "v": 0.03,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D22": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "O22": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "A23": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B23": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D23": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E23": {
        "v": 63021285.71,
        "f": "SUM(E21:O21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F23": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G23": {
        "bd": true
      },
      "H23": {
        "v": 147.8705674,
        "f": "(E23/B2)*(1-B23)",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I23": {
        "fg": "#000000",
        "bd": true
      },
      "J23": {
        "fg": "#000000",
        "bd": true
      },
      "K23": {
        "fg": "#000000",
        "bd": true
      },
      "L23": {
        "fg": "#000000",
        "bd": true
      },
      "M23": {
        "fg": "#000000",
        "bd": true
      },
      "N23": {
        "fg": "#000000",
        "bd": true
      },
      "O23": {
        "fg": "#000000",
        "bd": true
      },
      "D25": {
        "v": "Scenarious",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E25": {
        "v": "Weight",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F25": {
        "v": "Intrinsic Value",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G25": {
        "v": "IV x Weight",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H25": {
        "v": "Average Intrinsic Value",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I25": {
        "bd": true
      },
      "J25": {
        "fg": "#000000",
        "bd": true
      },
      "K25": {
        "bd": true
      },
      "L25": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "N25": {
        "v": "Млрд. (B)",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O25": {
        "v": "Хил. (K)",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "D26": {
        "v": "Optimistic",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E26": {
        "v": 0.25,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F26": {
        "v": 248.3651277,
        "f": "H9",
        "fg": "#000000",
        "i": true,
        "al": "right",
        "bd": true,
        "fmt": "currency0"
      },
      "G26": {
        "v": 62.09128194,
        "f": "F26*E26",
        "fg": "#000000",
        "i": true,
        "al": "right",
        "bd": true,
        "fmt": "currency0"
      },
      "H26": {
        "v": 184.7431606,
        "f": "sum(G26:G28)",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I26": {
        "bd": true
      },
      "K26": {
        "v": "#REF!",
        "f": "if(H26>E1,\"BUY\",\"SELL\")",
        "fg": "#000000",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true
      },
      "L26": {
        "bd": true
      },
      "N26": {
        "v": 0,
        "bg": "#FDD868",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "O26": {
        "v": 0,
        "f": "N26*1000000",
        "bg": "#FDD868",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "D27": {
        "v": "Average",
        "bg": "#3C78D8",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E27": {
        "v": 0.5,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F27": {
        "v": 171.3684736,
        "f": "H16",
        "fg": "#000000",
        "i": true,
        "al": "right",
        "bd": true,
        "fmt": "currency0"
      },
      "G27": {
        "v": 85.68423678,
        "f": "F27*E27",
        "fg": "#000000",
        "i": true,
        "al": "right",
        "bd": true,
        "fmt": "currency0"
      },
      "H27": {
        "bd": true
      },
      "I27": {
        "bd": true
      },
      "K27": {
        "bd": true
      },
      "L27": {
        "bd": true
      },
      "D28": {
        "v": "Worst",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E28": {
        "v": 0.25,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F28": {
        "v": 147.8705674,
        "f": "H23",
        "fg": "#000000",
        "i": true,
        "al": "right",
        "bd": true,
        "fmt": "currency0"
      },
      "G28": {
        "v": 36.96764185,
        "f": "F28*E28",
        "fg": "#000000",
        "i": true,
        "al": "right",
        "bd": true,
        "fmt": "currency0"
      },
      "H28": {
        "bd": true
      },
      "I28": {
        "bd": true
      },
      "K28": {
        "bd": true
      },
      "L28": {
        "bd": true
      },
      "D29": {
        "fg": "#000000",
        "bd": true
      },
      "E29": {
        "v": 1.0,
        "f": "sum(E26:E28)",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "L29": {
        "fg": "#000000",
        "bd": true
      },
      "D30": {
        "fg": "#000000",
        "bd": true
      },
      "F30": {
        "v": "Under / Over Valued",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 12.0,
        "al": "center",
        "bd": true
      },
      "G30": {
        "bd": true
      },
      "H30": {
        "v": "#REF!",
        "f": "H26/E1-1",
        "fg": "#000000",
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "I30": {
        "bd": true
      },
      "L30": {
        "fg": "#000000",
        "bd": true
      },
      "N30": {
        "v": "Трл. (T)",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O30": {
        "v": "Хил. (K)",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "D31": {
        "fg": "#000000",
        "bd": true
      },
      "E31": {
        "fg": "#000000",
        "bd": true
      },
      "F31": {
        "bd": true
      },
      "G31": {
        "bd": true
      },
      "H31": {
        "bd": true
      },
      "I31": {
        "bd": true
      },
      "J31": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "K31": {
        "fg": "#000000",
        "bd": true
      },
      "L31": {
        "fg": "#000000",
        "bd": true
      },
      "N31": {
        "v": 1.68,
        "bg": "#FDD868",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "O31": {
        "v": 1680000000,
        "f": "N31*1000000000",
        "bg": "#FDD868",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "D33": {
        "v": "Market Cap DCF",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true,
        "cm": "Връзката между Market Cap и DCF:\n\nАнализаторите и инвеститорите използват DCF модела, за да определят справедливата, вътрешна стойност на собствения капитал (equity value) на компанията. След това тази изчислена вътрешна стойност се сравнява с текущата пазарна капитализация. \n\nАко Market Cap е по-ниска от стойността, изчислена по DCF, компанията може да е подценена (undervalued).\n\nАко Market Cap е по-висока от стойността по DCF, компанията може да е надценена (overvalued).\n\nНакратко, \"Market Cap DCF\" вероятно е разговорен начин за описване на процеса на използване на DCF анализа като еталон за оценка на това дали текущата пазарна капитализация е разумна."
      },
      "E33": {
        "bd": true
      },
      "F33": {
        "bd": true
      },
      "G33": {
        "bd": true
      },
      "H33": {
        "bd": true
      },
      "I33": {
        "bd": true
      },
      "J33": {
        "bd": true
      },
      "K33": {
        "bd": true
      },
      "L33": {
        "bd": true
      },
      "D34": {
        "v": "Market Cap",
        "bg": "#9FC5E8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E34": {
        "v": 104680936.125,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "integer"
      },
      "F34": {
        "bd": true
      },
      "L34": {
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "D35": {
        "fg": "#000000",
        "bd": true
      },
      "L35": {
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "D36": {
        "v": "Scenarious",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E36": {
        "v": "Weight",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F36": {
        "v": "Intrinsic Value",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G36": {
        "v": "IV x Weight",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H36": {
        "v": "Average Intrinsic Value",
        "bg": "#002060",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I36": {
        "bd": true
      },
      "L36": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D37": {
        "v": "Optimistic",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E37": {
        "v": 0.25,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F37": {
        "v": 105851285.7,
        "f": "E9",
        "fg": "#000000",
        "i": true,
        "al": "right",
        "bd": true,
        "fmt": "currency0"
      },
      "G37": {
        "v": 26462821.43,
        "f": "F37*E37",
        "fg": "#000000",
        "i": true,
        "al": "right",
        "bd": true,
        "fmt": "currency0"
      },
      "H37": {
        "v": 70862488.33,
        "f": "sum(G37:G39)*(1-B23)",
        "fg": "#000000",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I37": {
        "bd": true
      },
      "K37": {
        "v": "SELL",
        "f": "if(H37>E34,\"BUY\",\"SELL\")",
        "fg": "#000000",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true
      },
      "L37": {
        "bd": true
      },
      "D38": {
        "v": "Average",
        "bg": "#3C78D8",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E38": {
        "v": 0.5,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F38": {
        "v": 73035910.57,
        "f": "E16",
        "fg": "#000000",
        "i": true,
        "al": "right",
        "bd": true,
        "fmt": "currency0"
      },
      "G38": {
        "v": 36517955.28,
        "f": "F38*E38",
        "fg": "#000000",
        "i": true,
        "al": "right",
        "bd": true,
        "fmt": "currency0"
      },
      "H38": {
        "bd": true
      },
      "I38": {
        "bd": true
      },
      "K38": {
        "bd": true
      },
      "L38": {
        "bd": true
      },
      "D39": {
        "v": "Worst",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E39": {
        "v": 0.25,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F39": {
        "v": 63021285.71,
        "f": "E23",
        "fg": "#000000",
        "i": true,
        "al": "right",
        "bd": true,
        "fmt": "currency0"
      },
      "G39": {
        "v": 15755321.43,
        "f": "F39*E39",
        "fg": "#000000",
        "i": true,
        "al": "right",
        "bd": true,
        "fmt": "currency0"
      },
      "H39": {
        "bd": true
      },
      "I39": {
        "bd": true
      },
      "K39": {
        "bd": true
      },
      "L39": {
        "bd": true
      },
      "D40": {
        "fg": "#000000",
        "bd": true
      },
      "E40": {
        "v": 1.0,
        "f": "sum(E37:E39)",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "L40": {
        "fg": "#000000",
        "bd": true
      },
      "D41": {
        "fg": "#000000",
        "bd": true
      },
      "F41": {
        "v": "Under / Over Valued",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 12.0,
        "al": "center",
        "bd": true
      },
      "G41": {
        "bd": true
      },
      "H41": {
        "v": -0.3230621453,
        "f": "H37/E34-1",
        "fg": "#000000",
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "I41": {
        "bd": true
      },
      "L41": {
        "fg": "#000000",
        "bd": true
      },
      "D42": {
        "fg": "#000000",
        "bd": true
      },
      "E42": {
        "fg": "#000000",
        "bd": true
      },
      "F42": {
        "bd": true
      },
      "G42": {
        "bd": true
      },
      "H42": {
        "bd": true
      },
      "I42": {
        "bd": true
      },
      "J42": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "K42": {
        "fg": "#000000",
        "bd": true
      },
      "L42": {
        "fg": "#000000",
        "bd": true
      }
    }
  },
  {
    "id": "fcfMultiple",
    "title": "FCF Multiple",
    "maxCol": 31,
    "maxRow": 42,
    "colWidths": {
      "1": 142,
      "2": 107,
      "3": 24,
      "4": 113,
      "5": 95,
      "6": 95,
      "7": 95,
      "8": 95,
      "9": 95,
      "10": 95,
      "11": 95,
      "12": 95,
      "13": 95,
      "14": 95,
      "15": 113,
      "16": 24,
      "17": 111,
      "18": 111,
      "19": 24,
      "20": 85,
      "21": 85,
      "22": 85,
      "23": 85,
      "24": 85,
      "25": 85,
      "26": 85,
      "27": 85,
      "28": 85,
      "29": 85,
      "30": 85,
      "31": 85
    },
    "merges": [
      {
        "ref": "F1:J1",
        "r1": 1,
        "c1": 6,
        "r2": 1,
        "c2": 10
      },
      {
        "ref": "A4:B4",
        "r1": 4,
        "c1": 1,
        "r2": 4,
        "c2": 2
      },
      {
        "ref": "Q4:R4",
        "r1": 4,
        "c1": 17,
        "r2": 4,
        "c2": 18
      },
      {
        "ref": "T4:AE4",
        "r1": 4,
        "c1": 20,
        "r2": 4,
        "c2": 31
      },
      {
        "ref": "Q8:R8",
        "r1": 8,
        "c1": 17,
        "r2": 8,
        "c2": 18
      },
      {
        "ref": "F9:G9",
        "r1": 9,
        "c1": 6,
        "r2": 9,
        "c2": 7
      },
      {
        "ref": "A11:B11",
        "r1": 11,
        "c1": 1,
        "r2": 11,
        "c2": 2
      },
      {
        "ref": "T10:U10",
        "r1": 10,
        "c1": 20,
        "r2": 10,
        "c2": 21
      },
      {
        "ref": "T11:U11",
        "r1": 11,
        "c1": 20,
        "r2": 11,
        "c2": 21
      },
      {
        "ref": "Q14:R14",
        "r1": 14,
        "c1": 17,
        "r2": 14,
        "c2": 18
      },
      {
        "ref": "F16:G16",
        "r1": 16,
        "c1": 6,
        "r2": 16,
        "c2": 7
      },
      {
        "ref": "A18:B18",
        "r1": 18,
        "c1": 1,
        "r2": 18,
        "c2": 2
      },
      {
        "ref": "Q18:R18",
        "r1": 18,
        "c1": 17,
        "r2": 18,
        "c2": 18
      },
      {
        "ref": "F23:G23",
        "r1": 23,
        "c1": 6,
        "r2": 23,
        "c2": 7
      },
      {
        "ref": "F39:G40",
        "r1": 39,
        "c1": 6,
        "r2": 40,
        "c2": 7
      },
      {
        "ref": "H39:I40",
        "r1": 39,
        "c1": 8,
        "r2": 40,
        "c2": 9
      },
      {
        "ref": "H25:I25",
        "r1": 25,
        "c1": 8,
        "r2": 25,
        "c2": 9
      },
      {
        "ref": "H26:I28",
        "r1": 26,
        "c1": 8,
        "r2": 28,
        "c2": 9
      },
      {
        "ref": "K26:L28",
        "r1": 26,
        "c1": 11,
        "r2": 28,
        "c2": 12
      },
      {
        "ref": "F30:G31",
        "r1": 30,
        "c1": 6,
        "r2": 31,
        "c2": 7
      },
      {
        "ref": "H30:I31",
        "r1": 30,
        "c1": 8,
        "r2": 31,
        "c2": 9
      },
      {
        "ref": "H34:I34",
        "r1": 34,
        "c1": 8,
        "r2": 34,
        "c2": 9
      },
      {
        "ref": "H35:I37",
        "r1": 35,
        "c1": 8,
        "r2": 37,
        "c2": 9
      }
    ],
    "cells": {
      "A1": {
        "v": "Company ",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B1": {
        "v": "#REF!",
        "f": "'Stock Valuation'!B2",
        "bg": "#93C47D",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D1": {
        "v": "Market Cap",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E1": {
        "v": 105647508.58,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "integer"
      },
      "F1": {
        "v": "* Въвеждайте стойности само в жълтите полета",
        "fg": "#F1C232",
        "b": true,
        "al": "center"
      },
      "K1": {
        "v": "Data",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "L1": {
        "v": "#REF!",
        "f": "Overview!G6",
        "bg": "#93C47D",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "date"
      },
      "A2": {
        "v": "Free Cash Flow",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B2": {
        "v": 4283000,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "integer",
        "cm": "Тук въвеждаме последния Free Cash Flow, който имаме за компанията или средния за 10 годишен или 5 годишен период. Взимаме средния FCF като го сметнем с таблицата на Stock Valuation tab-а. Намираме историята на FCF в macrotrends чрез търсене в Google, копираме данните за последните 10 години и ги paste-ваме в Stock Valuation tab-а. Ако искаме да вземем последния FCF, намираме го от yahoo finance Financial таба за съответната компания и след това отиваме на Cash Flow Statement и най-долу взимаме стойността на Free Cash Flow TTM."
      },
      "A4": {
        "v": "Optimistic Scenario",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B4": {
        "bd": true
      },
      "D4": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E4": {
        "v": 2027,
        "f": "D4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F4": {
        "v": 2028,
        "f": "E4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G4": {
        "v": 2029,
        "f": "F4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H4": {
        "v": 2030,
        "f": "G4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I4": {
        "v": 2031,
        "f": "H4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J4": {
        "v": 2032,
        "f": "I4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K4": {
        "v": 2033,
        "f": "J4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L4": {
        "v": 2034,
        "f": "K4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M4": {
        "v": 2035,
        "f": "L4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N4": {
        "v": 2036,
        "f": "M4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O4": {
        "v": "Terminal Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "Q4": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R4": {
        "bd": true
      },
      "T4": {
        "v": "10 Years FCF",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "U4": {
        "bd": true
      },
      "V4": {
        "bd": true
      },
      "W4": {
        "bd": true
      },
      "X4": {
        "bd": true
      },
      "Y4": {
        "bd": true
      },
      "Z4": {
        "bd": true
      },
      "AA4": {
        "bd": true
      },
      "AB4": {
        "bd": true
      },
      "AC4": {
        "bd": true
      },
      "AD4": {
        "bd": true
      },
      "AE4": {
        "bd": true
      },
      "A5": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B5": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D5": {
        "v": 4283000.0,
        "f": "B2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E5": {
        "v": 4711300.0,
        "f": "D5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F5": {
        "v": 5182430.0,
        "f": "E5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G5": {
        "v": 5700673.0,
        "f": "F5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H5": {
        "v": 6270740.3,
        "f": "G5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I5": {
        "v": 6897814.33,
        "f": "H5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J5": {
        "v": 7587595.763,
        "f": "I5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K5": {
        "v": 8346355.339,
        "f": "J5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L5": {
        "v": 9180990.873,
        "f": "K5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M5": {
        "v": 10099089.96,
        "f": "L5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N5": {
        "v": 11108998.96,
        "f": "M5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O5": {
        "v": 11108998.96,
        "f": "N5",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q5": {
        "v": "Amount Invested",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R5": {
        "v": 5618.0,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "T5": {
        "v": "Year 0",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "U5": {
        "v": "Year 1",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "V5": {
        "v": "Year 2",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "W5": {
        "v": "Year 3",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "X5": {
        "v": "Year 4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Y5": {
        "v": "Year 5",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Z5": {
        "v": "Year 6",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AA5": {
        "v": "Year 7",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AB5": {
        "v": "Year 8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AC5": {
        "v": "Year 9",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AD5": {
        "v": "Year 10",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AE5": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "A6": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B6": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D6": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O6": {
        "v": 166634984.3,
        "f": "(N5*B8)",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q6": {
        "v": "Amount Returned",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R6": {
        "v": 71611.0,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "T6": {
        "v": 2016,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "U6": {
        "v": 2017,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "V6": {
        "v": 2018,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "W6": {
        "v": 2019,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "X6": {
        "v": 2020,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Y6": {
        "v": 2021,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Z6": {
        "v": 2022,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AA6": {
        "v": 2023,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AB6": {
        "v": 2024,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AC6": {
        "v": 2025,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AD6": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AE6": {
        "v": "Average",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "A7": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B7": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D7": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E7": {
        "v": 4283000.0,
        "f": "E5/(1+$B$5)^1",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F7": {
        "v": 4283000.0,
        "f": "F5/(1+$B$5)^2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G7": {
        "v": 4283000.0,
        "f": "G5/(1+$B$5)^3",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H7": {
        "v": 4283000.0,
        "f": "H5/(1+$B$5)^4",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I7": {
        "v": 4283000.0,
        "f": "I5/(1+$B$5)^5",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J7": {
        "v": 4283000.0,
        "f": "J5/(1+$B$5)^6",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K7": {
        "v": 4283000.0,
        "f": "K5/(1+$B$5)^7",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L7": {
        "v": 4283000.0,
        "f": "L5/(1+$B$5)^8",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M7": {
        "v": 4283000.0,
        "f": "M5/(1+$B$5)^9",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N7": {
        "v": 4283000.0,
        "f": "N5/(1+$B$5)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O7": {
        "v": 64245000.0,
        "f": "O6/(1+$B$5)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q7": {
        "v": "Years",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R7": {
        "v": 5,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "T7": {
        "v": 711000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "U7": {
        "v": 1425000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "V7": {
        "v": 961000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "W7": {
        "v": 2038000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "X7": {
        "v": 1542000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "Y7": {
        "v": 2790000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "Z7": {
        "v": 2738000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AA7": {
        "v": 2036000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AB7": {
        "v": 3136000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AC7": {
        "v": 3487000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AD7": {
        "v": 4283000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AE7": {
        "v": 2286090.909,
        "f": "AVERAGE(T7:AD7)",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "A8": {
        "v": "FCF Multiple",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "cm": "Financecharts > Price/FCF Ratio"
      },
      "B8": {
        "v": 15,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D8": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "O8": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Q8": {
        "fg": "#000000",
        "bd": true
      },
      "R8": {
        "bd": true
      },
      "T8": {
        "bd": true
      },
      "U8": {
        "v": 1.004219409,
        "f": "IF(OR(T7=\"\", T7=0, U7=\"\"), \"\", (U7-T7)/ABS(T7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "V8": {
        "v": -0.3256140351,
        "f": "IF(OR(U7=\"\", U7=0, V7=\"\"), \"\", (V7-U7)/ABS(U7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "W8": {
        "v": 1.120707596,
        "f": "IF(OR(V7=\"\", V7=0, W7=\"\"), \"\", (W7-V7)/ABS(V7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "X8": {
        "v": -0.2433758587,
        "f": "IF(OR(W7=\"\", W7=0, X7=\"\"), \"\", (X7-W7)/ABS(W7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Y8": {
        "v": 0.8093385214,
        "f": "IF(OR(X7=\"\", X7=0, Y7=\"\"), \"\", (Y7-X7)/ABS(X7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Z8": {
        "v": -0.01863799283,
        "f": "IF(OR(Y7=\"\", Y7=0, Z7=\"\"), \"\", (Z7-Y7)/ABS(Y7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AA8": {
        "v": -0.2563915267,
        "f": "IF(OR(Z7=\"\", Z7=0, AA7=\"\"), \"\", (AA7-Z7)/ABS(Z7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AB8": {
        "v": 0.5402750491,
        "f": "IF(OR(AA7=\"\", AA7=0, AB7=\"\"), \"\", (AB7-AA7)/ABS(AA7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AC8": {
        "v": 0.1119260204,
        "f": "IF(OR(AB7=\"\", AB7=0, AC7=\"\"), \"\", (AC7-AB7)/ABS(AB7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AD8": {
        "v": 0.2282764554,
        "f": "IF(OR(AC7=\"\", AC7=0, AD7=\"\"), \"\", (AD7-AC7)/ABS(AC7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AE8": {
        "v": 0.2970723639,
        "f": "IFERROR(AVERAGE(U8:AD8), 0)",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A9": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B9": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D9": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E9": {
        "v": 107075000.0,
        "f": "SUM(E7:O7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F9": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G9": {
        "bd": true
      },
      "H9": {
        "v": 96367500.0,
        "f": "E9*(1-B9)",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I9": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "J9": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "K9": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "L9": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "M9": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "N9": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "O9": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "Q9": {
        "v": "ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R9": {
        "v": 11.74670701,
        "f": "(R6 - R5) / R5",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Q10": {
        "v": "Annualized ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R10": {
        "v": 0.6637175609,
        "f": "((1+(R6-R5)/R5)^(1/R7)-1)",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "T10": {
        "v": "Annual Growth Rate",
        "bg": "#D5A6BD",
        "fg": "#000000",
        "b": true,
        "bd": true
      },
      "U10": {
        "bd": true
      },
      "V10": {
        "v": 0.2970723639,
        "f": "IFERROR(AE8, 0)",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A11": {
        "v": "Average Scenario",
        "bg": "#4A86E8",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B11": {
        "bd": true
      },
      "D11": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E11": {
        "v": 2027,
        "f": "D11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F11": {
        "v": 2028,
        "f": "E11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G11": {
        "v": 2029,
        "f": "F11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H11": {
        "v": 2030,
        "f": "G11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I11": {
        "v": 2031,
        "f": "H11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J11": {
        "v": 2032,
        "f": "I11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K11": {
        "v": 2033,
        "f": "J11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L11": {
        "v": 2034,
        "f": "K11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M11": {
        "v": 2035,
        "f": "L11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N11": {
        "v": 2036,
        "f": "M11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O11": {
        "v": "Terminal Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "Q11": {
        "v": "Gain",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R11": {
        "v": 65993.0,
        "f": "R6-R5",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "T11": {
        "v": "CAGR",
        "bg": "#D5A6BD",
        "fg": "#000000",
        "b": true,
        "bd": true
      },
      "U11": {
        "bd": true
      },
      "V11": {
        "v": 0.196707044,
        "f": "CAGR(T7:AD7)",
        "bg": "#F9F9FF",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A12": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B12": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D12": {
        "v": 4283000.0,
        "f": "B2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E12": {
        "v": 4625640.0,
        "f": "D12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F12": {
        "v": 4995691.2,
        "f": "E12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G12": {
        "v": 5395346.496,
        "f": "F12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H12": {
        "v": 5826974.216,
        "f": "G12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I12": {
        "v": 6293132.153,
        "f": "H12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J12": {
        "v": 6796582.725,
        "f": "I12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K12": {
        "v": 7340309.343,
        "f": "J12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L12": {
        "v": 7927534.091,
        "f": "K12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M12": {
        "v": 8561736.818,
        "f": "L12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N12": {
        "v": 9246675.763,
        "f": "M12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O12": {
        "v": 9246675.763,
        "f": "N12",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "A13": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B13": {
        "v": 0.08,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D13": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O13": {
        "v": 110960109.2,
        "f": "(N12*B15)",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "A14": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B14": {
        "v": 0.08,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D14": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E14": {
        "v": 4205127.273,
        "f": "E12/(1+$B$12)^1",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F14": {
        "v": 4128670.413,
        "f": "F12/(1+$B$12)^2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G14": {
        "v": 4053603.678,
        "f": "G12/(1+$B$12)^3",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H14": {
        "v": 3979901.793,
        "f": "H12/(1+$B$12)^4",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I14": {
        "v": 3907539.943,
        "f": "I12/(1+$B$12)^5",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J14": {
        "v": 3836493.762,
        "f": "J12/(1+$B$12)^6",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K14": {
        "v": 3766739.33,
        "f": "K12/(1+$B$12)^7",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L14": {
        "v": 3698253.16,
        "f": "L12/(1+$B$12)^8",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M14": {
        "v": 3631012.194,
        "f": "M12/(1+$B$12)^9",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N14": {
        "v": 3564993.79,
        "f": "N12/(1+$B$12)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O14": {
        "v": 42779925.48,
        "f": "O13/(1+$B$12)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q14": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R14": {
        "bd": true
      },
      "A15": {
        "v": "FCF Multiple",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "cm": "Financecharts > Price/FCF Ratio"
      },
      "B15": {
        "v": 12.0,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "D15": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "O15": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Q15": {
        "v": "Amount Invested",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R15": {
        "v": 23724.0,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "A16": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B16": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D16": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E16": {
        "v": 81552260.82,
        "f": "SUM(E14:O14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F16": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G16": {
        "bd": true
      },
      "H16": {
        "v": 73397034.74,
        "f": "E16*(1-B16)",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I16": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "J16": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "K16": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "L16": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "M16": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "N16": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "O16": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "Q16": {
        "v": "Amount Returned",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R16": {
        "v": 71611.0,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "Q17": {
        "v": "Years",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R17": {
        "v": 10,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "A18": {
        "v": "Worst Scenario",
        "bg": "#FF0000",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B18": {
        "bd": true
      },
      "D18": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E18": {
        "v": 2027,
        "f": "D18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F18": {
        "v": 2028,
        "f": "E18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G18": {
        "v": 2029,
        "f": "F18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H18": {
        "v": 2030,
        "f": "G18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I18": {
        "v": 2031,
        "f": "H18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J18": {
        "v": 2032,
        "f": "I18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K18": {
        "v": 2033,
        "f": "J18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L18": {
        "v": 2034,
        "f": "K18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M18": {
        "v": 2035,
        "f": "L18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N18": {
        "v": 2036,
        "f": "M18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O18": {
        "v": "Terminal Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "Q18": {
        "fg": "#000000",
        "bd": true
      },
      "R18": {
        "bd": true
      },
      "A19": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B19": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D19": {
        "v": 4283000.0,
        "f": "B2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E19": {
        "v": 4411490.0,
        "f": "D19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F19": {
        "v": 4543834.7,
        "f": "E19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G19": {
        "v": 4680149.741,
        "f": "F19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H19": {
        "v": 4820554.233,
        "f": "G19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I19": {
        "v": 4965170.86,
        "f": "H19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J19": {
        "v": 5114125.986,
        "f": "I19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K19": {
        "v": 5267549.766,
        "f": "J19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L19": {
        "v": 5425576.259,
        "f": "K19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M19": {
        "v": 5588343.546,
        "f": "L19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N19": {
        "v": 5755993.853,
        "f": "M19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O19": {
        "v": 5755993.853,
        "f": "N19",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q19": {
        "v": "ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R19": {
        "v": 2.018504468,
        "f": "(R16 - R15) / R15",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A20": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B20": {
        "v": 0.03,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D20": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O20": {
        "v": 28779969.26,
        "f": "(N19*B22)",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q20": {
        "v": "Annualized ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R20": {
        "v": 0.1168097128,
        "f": "((1+(R16-R15)/R15)^(1/R17)-1)",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A21": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B21": {
        "v": 0.03,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D21": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E21": {
        "v": 4010445.455,
        "f": "E19/(1+$B$19)^1",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F21": {
        "v": 3755235.289,
        "f": "F19/(1+$B$19)^2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G21": {
        "v": 3516265.771,
        "f": "G19/(1+$B$19)^3",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H21": {
        "v": 3292503.404,
        "f": "H19/(1+$B$19)^4",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I21": {
        "v": 3082980.46,
        "f": "I19/(1+$B$19)^5",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J21": {
        "v": 2886790.794,
        "f": "J19/(1+$B$19)^6",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K21": {
        "v": 2703085.925,
        "f": "K19/(1+$B$19)^7",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L21": {
        "v": 2531071.367,
        "f": "L19/(1+$B$19)^8",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M21": {
        "v": 2370003.189,
        "f": "M19/(1+$B$19)^9",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N21": {
        "v": 2219184.804,
        "f": "N19/(1+$B$19)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O21": {
        "v": 11095924.02,
        "f": "O20/(1+$B$5)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q21": {
        "v": "Gain",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R21": {
        "v": 47887.0,
        "f": "R16-R15",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "A22": {
        "v": "FCF Multiple",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "cm": "Financecharts > Price/FCF Ratio"
      },
      "B22": {
        "v": 5.0,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "D22": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "O22": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "A23": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B23": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D23": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E23": {
        "v": 41463490.48,
        "f": "SUM(E21:O21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F23": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G23": {
        "bd": true
      },
      "H23": {
        "v": 37317141.43,
        "f": "E23*(1-B23)",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I23": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "J23": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "K23": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "L23": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "M23": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "N23": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "O23": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "D25": {
        "v": "Scenarious",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E25": {
        "v": "Weight",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F25": {
        "v": "Intrinsic Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G25": {
        "v": "IV x Weight",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H25": {
        "v": "Average Intrinsic Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I25": {
        "bd": true
      },
      "J25": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "K25": {
        "bd": true
      },
      "L25": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "N25": {
        "v": "Млрд. (B)",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O25": {
        "v": "Хил. (K)",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "D26": {
        "v": "Optimistic",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E26": {
        "v": 0.25,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F26": {
        "v": 96367500.0,
        "f": "H9",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G26": {
        "v": 24091875.0,
        "f": "F26*E26",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H26": {
        "v": 70119677.72,
        "f": "sum(G26:G28)",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I26": {
        "bd": true
      },
      "K26": {
        "v": "SELL",
        "f": "if(H26>E1,\"BUY\",\"SELL\")",
        "fg": "#000000",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true
      },
      "L26": {
        "bd": true
      },
      "N26": {
        "v": 0,
        "bg": "#FDD868",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "O26": {
        "v": 0,
        "f": "N26*1000000",
        "bg": "#FDD868",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "D27": {
        "v": "Average",
        "bg": "#3C78D8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E27": {
        "v": 0.5,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F27": {
        "v": 73397034.74,
        "f": "H16",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G27": {
        "v": 36698517.37,
        "f": "F27*E27",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H27": {
        "bd": true
      },
      "I27": {
        "bd": true
      },
      "K27": {
        "bd": true
      },
      "L27": {
        "bd": true
      },
      "D28": {
        "v": "Worst",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E28": {
        "v": 0.25,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F28": {
        "v": 37317141.43,
        "f": "H23",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G28": {
        "v": 9329285.357,
        "f": "F28*E28",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H28": {
        "bd": true
      },
      "I28": {
        "bd": true
      },
      "K28": {
        "bd": true
      },
      "L28": {
        "bd": true
      },
      "D29": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "E29": {
        "v": 1.0,
        "f": "sum(E26:E28)",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "L29": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "D30": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F30": {
        "v": "Under / Over Valued",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 12.0,
        "al": "center",
        "bd": true
      },
      "G30": {
        "bd": true
      },
      "H30": {
        "v": -0.3362864996,
        "f": "H26/E1-1",
        "fg": "#000000",
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "I30": {
        "bd": true
      },
      "L30": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "N30": {
        "v": "Трл. (T)",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O30": {
        "v": "Хил. (K)",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "D31": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "E31": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F31": {
        "bd": true
      },
      "G31": {
        "bd": true
      },
      "H31": {
        "bd": true
      },
      "I31": {
        "bd": true
      },
      "J31": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "K31": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "L31": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "N31": {
        "v": 0,
        "bg": "#FDD868",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "O31": {
        "v": 0,
        "f": "N31*1000000000",
        "bg": "#FDD868",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "D34": {
        "v": "Scenarious",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E34": {
        "v": "Weight",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F34": {
        "v": "Intrinsic Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G34": {
        "v": "IV x Weight",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H34": {
        "v": "Average Intrinsic Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I34": {
        "bd": true
      },
      "J34": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "K34": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "L34": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "D35": {
        "v": "Optimistic",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E35": {
        "v": 0.25,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F35": {
        "v": 251.2364009,
        "f": "H9/E41",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G35": {
        "v": 62.80910022,
        "f": "F35*E35",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H35": {
        "v": 182.8066045,
        "f": "sum(G35:G37)",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I35": {
        "bd": true
      },
      "L35": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "D36": {
        "v": "Average",
        "bg": "#3C78D8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E36": {
        "v": 0.5,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F36": {
        "v": 191.3508895,
        "f": "H16/E41",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G36": {
        "v": 95.67544475,
        "f": "F36*E36",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H36": {
        "bd": true
      },
      "I36": {
        "bd": true
      },
      "L36": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "D37": {
        "v": "Worst",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E37": {
        "v": 0.25,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F37": {
        "v": 97.2882383,
        "f": "H23/E41",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G37": {
        "v": 24.32205957,
        "f": "F37*E37",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H37": {
        "bd": true
      },
      "I37": {
        "bd": true
      },
      "L37": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "D38": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "E38": {
        "v": 1.0,
        "f": "sum(E35:E37)",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "L38": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "D39": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "F39": {
        "v": "Under / Over Valued",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 12.0,
        "al": "center",
        "bd": true
      },
      "G39": {
        "bd": true
      },
      "H39": {
        "v": -0.3303296778,
        "f": "H35/E42-1",
        "fg": "#000000",
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "I39": {
        "bd": true
      },
      "L39": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "D40": {
        "bd": true
      },
      "F40": {
        "bd": true
      },
      "G40": {
        "bd": true
      },
      "H40": {
        "bd": true
      },
      "I40": {
        "bd": true
      },
      "L40": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "D41": {
        "v": "Shares Outstan.",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E41": {
        "v": 383573,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "integer"
      },
      "L41": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "D42": {
        "v": "Market Price",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E42": {
        "v": 272.98,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "F42": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "G42": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "H42": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "I42": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "J42": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "K42": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "L42": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      }
    }
  },
  {
    "id": "evEbitda",
    "title": "EVEBITDA",
    "maxCol": 31,
    "maxRow": 42,
    "colWidths": {
      "1": 142,
      "2": 107,
      "3": 24,
      "4": 113,
      "5": 95,
      "6": 95,
      "7": 95,
      "8": 95,
      "9": 95,
      "10": 95,
      "11": 95,
      "12": 95,
      "13": 95,
      "14": 95,
      "15": 113,
      "16": 24,
      "17": 111,
      "18": 111,
      "19": 24,
      "20": 85,
      "21": 85,
      "22": 85,
      "23": 85,
      "24": 85,
      "25": 85,
      "26": 85,
      "27": 85,
      "28": 85,
      "29": 85,
      "30": 85,
      "31": 85
    },
    "merges": [
      {
        "ref": "F1:J1",
        "r1": 1,
        "c1": 6,
        "r2": 1,
        "c2": 10
      },
      {
        "ref": "A4:B4",
        "r1": 4,
        "c1": 1,
        "r2": 4,
        "c2": 2
      },
      {
        "ref": "Q4:R4",
        "r1": 4,
        "c1": 17,
        "r2": 4,
        "c2": 18
      },
      {
        "ref": "T4:AE4",
        "r1": 4,
        "c1": 20,
        "r2": 4,
        "c2": 31
      },
      {
        "ref": "Q8:R8",
        "r1": 8,
        "c1": 17,
        "r2": 8,
        "c2": 18
      },
      {
        "ref": "F9:G9",
        "r1": 9,
        "c1": 6,
        "r2": 9,
        "c2": 7
      },
      {
        "ref": "A11:B11",
        "r1": 11,
        "c1": 1,
        "r2": 11,
        "c2": 2
      },
      {
        "ref": "T10:U10",
        "r1": 10,
        "c1": 20,
        "r2": 10,
        "c2": 21
      },
      {
        "ref": "T11:U11",
        "r1": 11,
        "c1": 20,
        "r2": 11,
        "c2": 21
      },
      {
        "ref": "Q14:R14",
        "r1": 14,
        "c1": 17,
        "r2": 14,
        "c2": 18
      },
      {
        "ref": "F16:G16",
        "r1": 16,
        "c1": 6,
        "r2": 16,
        "c2": 7
      },
      {
        "ref": "A18:B18",
        "r1": 18,
        "c1": 1,
        "r2": 18,
        "c2": 2
      },
      {
        "ref": "Q18:R18",
        "r1": 18,
        "c1": 17,
        "r2": 18,
        "c2": 18
      },
      {
        "ref": "F23:G23",
        "r1": 23,
        "c1": 6,
        "r2": 23,
        "c2": 7
      },
      {
        "ref": "H36:I36",
        "r1": 36,
        "c1": 8,
        "r2": 36,
        "c2": 9
      },
      {
        "ref": "H37:I39",
        "r1": 37,
        "c1": 8,
        "r2": 39,
        "c2": 9
      },
      {
        "ref": "K37:L39",
        "r1": 37,
        "c1": 11,
        "r2": 39,
        "c2": 12
      },
      {
        "ref": "F41:G42",
        "r1": 41,
        "c1": 6,
        "r2": 42,
        "c2": 7
      },
      {
        "ref": "H41:I42",
        "r1": 41,
        "c1": 8,
        "r2": 42,
        "c2": 9
      },
      {
        "ref": "H25:I25",
        "r1": 25,
        "c1": 8,
        "r2": 25,
        "c2": 9
      },
      {
        "ref": "H26:I28",
        "r1": 26,
        "c1": 8,
        "r2": 28,
        "c2": 9
      },
      {
        "ref": "K26:L28",
        "r1": 26,
        "c1": 11,
        "r2": 28,
        "c2": 12
      },
      {
        "ref": "F30:G31",
        "r1": 30,
        "c1": 6,
        "r2": 31,
        "c2": 7
      },
      {
        "ref": "H30:I31",
        "r1": 30,
        "c1": 8,
        "r2": 31,
        "c2": 9
      },
      {
        "ref": "D33:L33",
        "r1": 33,
        "c1": 4,
        "r2": 33,
        "c2": 12
      },
      {
        "ref": "E34:F34",
        "r1": 34,
        "c1": 5,
        "r2": 34,
        "c2": 6
      }
    ],
    "cells": {
      "A1": {
        "v": "Company ",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B1": {
        "v": "#REF!",
        "f": "'Stock Valuation'!B2",
        "bg": "#93C47D",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D1": {
        "v": "Marcet Price",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E1": {
        "v": 273.11,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "F1": {
        "v": "* Въвеждайте стойности само в жълтите полета",
        "fg": "#F1C232",
        "b": true,
        "al": "center"
      },
      "K1": {
        "v": "Data",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "L1": {
        "v": "#REF!",
        "f": "Overview!G6",
        "bg": "#93C47D",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "date"
      },
      "A2": {
        "v": "Shares Outstanding",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B2": {
        "v": 383573,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "integer"
      },
      "A4": {
        "v": "Optimistic Scenario",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B4": {
        "bd": true
      },
      "D4": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E4": {
        "v": 2027,
        "f": "D4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F4": {
        "v": 2028,
        "f": "E4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G4": {
        "v": 2029,
        "f": "F4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H4": {
        "v": 2030,
        "f": "G4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I4": {
        "v": 2031,
        "f": "H4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J4": {
        "v": 2032,
        "f": "I4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K4": {
        "v": 2033,
        "f": "J4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L4": {
        "v": 2034,
        "f": "K4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M4": {
        "v": 2035,
        "f": "L4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N4": {
        "v": 2036,
        "f": "M4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O4": {
        "v": "Terminal Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "Q4": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R4": {
        "bd": true
      },
      "T4": {
        "v": "10 Years EV/EBITDA",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "U4": {
        "bd": true
      },
      "V4": {
        "bd": true
      },
      "W4": {
        "bd": true
      },
      "X4": {
        "bd": true
      },
      "Y4": {
        "bd": true
      },
      "Z4": {
        "bd": true
      },
      "AA4": {
        "bd": true
      },
      "AB4": {
        "bd": true
      },
      "AC4": {
        "bd": true
      },
      "AD4": {
        "bd": true
      },
      "AE4": {
        "bd": true
      },
      "A5": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B5": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D5": {
        "v": 6082000,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "integer",
        "cm": "Тук въвеждаме последната EBITDA, който имаме за компанията или средния за 10 годишен или 5 годишен период. Взимаме средния FCF като го сметнем с таблицата на Stock Valuation tab-а. Намираме историята на FCF в macrotrends чрез търсене в Google, копираме данните за последните 10 години и ги paste-ваме в Stock Valuation tab-а. Ако искаме да вземем последния FCF, намираме го от yahoo finance Financial таба за съответната компания и след това отиваме на Cash Flow Statement и най-долу взимаме стойността на Free Cash Flow TTM."
      },
      "E5": {
        "v": 6690200.0,
        "f": "D5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F5": {
        "v": 7359220.0,
        "f": "E5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G5": {
        "v": 8095142.0,
        "f": "F5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H5": {
        "v": 8904656.2,
        "f": "G5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I5": {
        "v": 9795121.82,
        "f": "H5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J5": {
        "v": 10774634.0,
        "f": "I5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K5": {
        "v": 11852097.4,
        "f": "J5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L5": {
        "v": 13037307.14,
        "f": "K5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M5": {
        "v": 14341037.86,
        "f": "L5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N5": {
        "v": 15775141.64,
        "f": "M5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O5": {
        "v": 15775141.64,
        "f": "N5",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q5": {
        "v": "Amount Invested",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R5": {
        "v": 2721000,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "T5": {
        "v": "Year 0",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "U5": {
        "v": "Year 1",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "V5": {
        "v": "Year 2",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "W5": {
        "v": "Year 3",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "X5": {
        "v": "Year 4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Y5": {
        "v": "Year 5",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Z5": {
        "v": "Year 6",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AA5": {
        "v": "Year 7",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AB5": {
        "v": "Year 8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AC5": {
        "v": "Year 9",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AD5": {
        "v": "Year 10",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AE5": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "A6": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B6": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D6": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O6": {
        "v": 394378541.1,
        "f": "O5*B8",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q6": {
        "v": "Amount Returned",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R6": {
        "v": 3035000,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "T6": {
        "v": 2016,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "U6": {
        "v": 2017,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "V6": {
        "v": 2018,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "W6": {
        "v": 2019,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "X6": {
        "v": 2020,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Y6": {
        "v": 2021,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Z6": {
        "v": 2022,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AA6": {
        "v": 2023,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AB6": {
        "v": 2024,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AC6": {
        "v": 2025,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AD6": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AE6": {
        "v": "Average",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "A7": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B7": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D7": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E7": {
        "v": 6082000.0,
        "f": "E5/(1+$B$5)^1",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F7": {
        "v": 6082000.0,
        "f": "F5/(1+$B$5)^2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G7": {
        "v": 6082000.0,
        "f": "G5/(1+$B$5)^3",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H7": {
        "v": 6082000.0,
        "f": "H5/(1+$B$5)^4",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I7": {
        "v": 6082000.0,
        "f": "I5/(1+$B$5)^5",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J7": {
        "v": 6082000.0,
        "f": "J5/(1+$B$5)^6",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K7": {
        "v": 6082000.0,
        "f": "K5/(1+$B$5)^7",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L7": {
        "v": 6082000.0,
        "f": "L5/(1+$B$5)^8",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M7": {
        "v": 6082000.0,
        "f": "M5/(1+$B$5)^9",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N7": {
        "v": 6082000.0,
        "f": "N5/(1+$B$5)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O7": {
        "v": 152050000.0,
        "f": "O6/(1+$B$5)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q7": {
        "v": "Years",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R7": {
        "v": 5,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "T7": {
        "v": 2258000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "U7": {
        "v": 2721000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "V7": {
        "v": 2939000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "W7": {
        "v": 3260000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "X7": {
        "v": 3491000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "Y7": {
        "v": 3035000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "Z7": {
        "v": 3574000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AA7": {
        "v": 3839000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AB7": {
        "v": 4916000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AC7": {
        "v": 4739000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AD7": {
        "v": 6082000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AE7": {
        "v": 3714000,
        "f": "AVERAGE(T7:AD7)",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "A8": {
        "v": "EBITDA Multiple",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B8": {
        "v": 25.0,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2",
        "cm": "Тук въвеждаме EV/EBITDA multiple-a (множителя) за продажба на компанията на 10-тата година.\n\nСтойността на този multiple взимаме за 3-те сценария според наши анализи на миналото представяне на компанията.\n\nМожем да използваме financecharts.com и да видим графично как се е движил този multiple през годините и да направим оптимистичен, среден и най-лош сценарий за нашата калкулация.\n\nEV/EBITDA множителя повлиява най-силно върху справедливата цена по този модел и трябва да бъдем внимателни какви стойности въвеждаме. Нека те да бъдат базирани на реални резултати от миналото."
      },
      "D8": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "O8": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Q8": {
        "fg": "#000000",
        "bd": true
      },
      "R8": {
        "bd": true
      },
      "T8": {
        "bd": true
      },
      "U8": {
        "v": 0.2050487157,
        "f": "IF(OR(T7=\"\", T7=0, U7=\"\"), \"\", (U7-T7)/ABS(T7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "V8": {
        "v": 0.08011760382,
        "f": "IF(OR(U7=\"\", U7=0, V7=\"\"), \"\", (V7-U7)/ABS(U7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "W8": {
        "v": 0.1092208234,
        "f": "IF(OR(V7=\"\", V7=0, W7=\"\"), \"\", (W7-V7)/ABS(V7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "X8": {
        "v": 0.07085889571,
        "f": "IF(OR(W7=\"\", W7=0, X7=\"\"), \"\", (X7-W7)/ABS(W7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Y8": {
        "v": -0.1306215984,
        "f": "IF(OR(X7=\"\", X7=0, Y7=\"\"), \"\", (Y7-X7)/ABS(X7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Z8": {
        "v": 0.1775947282,
        "f": "IF(OR(Y7=\"\", Y7=0, Z7=\"\"), \"\", (Z7-Y7)/ABS(Y7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AA8": {
        "v": 0.07414661444,
        "f": "IF(OR(Z7=\"\", Z7=0, AA7=\"\"), \"\", (AA7-Z7)/ABS(Z7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AB8": {
        "v": 0.2805418078,
        "f": "IF(OR(AA7=\"\", AA7=0, AB7=\"\"), \"\", (AB7-AA7)/ABS(AA7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AC8": {
        "v": -0.03600488202,
        "f": "IF(OR(AB7=\"\", AB7=0, AC7=\"\"), \"\", (AC7-AB7)/ABS(AB7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AD8": {
        "v": 0.2833931209,
        "f": "IF(OR(AC7=\"\", AC7=0, AD7=\"\"), \"\", (AD7-AC7)/ABS(AC7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AE8": {
        "v": 0.1114295829,
        "f": "IFERROR(AVERAGE(U8:AD8), 0)",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A9": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B9": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D9": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E9": {
        "v": 152050000.0,
        "f": "O7",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F9": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G9": {
        "bd": true
      },
      "H9": {
        "v": 356.7639015,
        "f": "(E9/B2)*(1-B9)",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I9": {
        "fg": "#000000",
        "bd": true
      },
      "J9": {
        "fg": "#000000",
        "bd": true
      },
      "K9": {
        "fg": "#000000",
        "bd": true
      },
      "L9": {
        "fg": "#000000",
        "bd": true
      },
      "M9": {
        "fg": "#000000",
        "bd": true
      },
      "N9": {
        "fg": "#000000",
        "bd": true
      },
      "O9": {
        "fg": "#000000",
        "bd": true
      },
      "Q9": {
        "v": "ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R9": {
        "v": 0.1153987505,
        "f": "(R6 - R5) / R5",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Q10": {
        "v": "Annualized ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R10": {
        "v": 0.02208268433,
        "f": "((1+(R6-R5)/R5)^(1/R7)-1)",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "T10": {
        "v": "Annual Growth Rate",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "bd": true
      },
      "U10": {
        "bd": true
      },
      "V10": {
        "v": 0.1114295829,
        "f": "IFERROR(AE8, 0)",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A11": {
        "v": "Average Scenario",
        "bg": "#4A86E8",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B11": {
        "bd": true
      },
      "D11": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E11": {
        "v": 2027,
        "f": "D11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F11": {
        "v": 2028,
        "f": "E11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G11": {
        "v": 2029,
        "f": "F11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H11": {
        "v": 2030,
        "f": "G11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I11": {
        "v": 2031,
        "f": "H11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J11": {
        "v": 2032,
        "f": "I11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K11": {
        "v": 2033,
        "f": "J11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L11": {
        "v": 2034,
        "f": "K11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M11": {
        "v": 2035,
        "f": "L11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N11": {
        "v": 2036,
        "f": "M11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O11": {
        "v": "Terminal Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "Q11": {
        "v": "Gain",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R11": {
        "v": 314000.0,
        "f": "R6-R5",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "T11": {
        "v": "CAGR",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "bd": true
      },
      "U11": {
        "bd": true
      },
      "V11": {
        "v": 0.1041606045,
        "f": "CAGR(T7:AD7)",
        "bg": "#F9F9FF",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A12": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B12": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D12": {
        "v": 6082000,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "integer",
        "cm": "Тук въвеждаме последната EBITDA, който имаме за компанията или средния за 10 годишен или 5 годишен период. Взимаме средния FCF като го сметнем с таблицата на Stock Valuation tab-а. Намираме историята на FCF в macrotrends чрез търсене в Google, копираме данните за последните 10 години и ги paste-ваме в Stock Valuation tab-а. Ако искаме да вземем последния FCF, намираме го от yahoo finance Financial таба за съответната компания и след това отиваме на Cash Flow Statement и най-долу взимаме стойността на Free Cash Flow TTM."
      },
      "E12": {
        "v": 6386100.0,
        "f": "D12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F12": {
        "v": 6705405.0,
        "f": "E12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G12": {
        "v": 7040675.25,
        "f": "F12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H12": {
        "v": 7392709.013,
        "f": "G12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I12": {
        "v": 7762344.463,
        "f": "H12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J12": {
        "v": 8150461.686,
        "f": "I12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K12": {
        "v": 8557984.771,
        "f": "J12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L12": {
        "v": 8985884.009,
        "f": "K12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M12": {
        "v": 9435178.21,
        "f": "L12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N12": {
        "v": 9906937.12,
        "f": "M12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O12": {
        "v": 9906937.12,
        "f": "N12",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "A13": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B13": {
        "v": 0.05,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D13": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O13": {
        "v": 198138742.4,
        "f": "O12*B15",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "A14": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B14": {
        "v": 0.05,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D14": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E14": {
        "v": 5805545.455,
        "f": "E12/(1+$B$12)^1",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F14": {
        "v": 5541657.025,
        "f": "F12/(1+$B$12)^2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G14": {
        "v": 5289763.524,
        "f": "G12/(1+$B$12)^3",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H14": {
        "v": 5049319.727,
        "f": "H12/(1+$B$12)^4",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I14": {
        "v": 4819805.194,
        "f": "I12/(1+$B$12)^5",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J14": {
        "v": 4600723.14,
        "f": "J12/(1+$B$12)^6",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K14": {
        "v": 4391599.361,
        "f": "K12/(1+$B$12)^7",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L14": {
        "v": 4191981.208,
        "f": "L12/(1+$B$12)^8",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M14": {
        "v": 4001436.608,
        "f": "M12/(1+$B$12)^9",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N14": {
        "v": 3819553.125,
        "f": "N12/(1+$B$12)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O14": {
        "v": 76391062.51,
        "f": "O13/(1+$B$12)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q14": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R14": {
        "bd": true
      },
      "A15": {
        "v": "EBITDA Multiple",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "cm": "Multiple за 10 години от Charta"
      },
      "B15": {
        "v": 20.0,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2",
        "cm": "Тук въвеждаме EV/EBITDA multiple-a (множителя) за продажба на компанията на 10-тата година.\n\nСтойността на този multiple взимаме за 3-те сценария според наши анализи на миналото представяне на компанията.\n\nМожем да използваме financecharts.com и да видим графично как се е движил този multiple през годините и да направим оптимистичен, среден и най-лош сценарий за нашата калкулация.\n\nEV/EBITDA множителя повлиява най-силно върху справедливата цена по този модел и трябва да бъдем внимателни какви стойности въвеждаме. Нека те да бъдат базирани на реални резултати от миналото."
      },
      "D15": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "O15": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Q15": {
        "v": "Amount Invested",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R15": {
        "v": 2721000,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "A16": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B16": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D16": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E16": {
        "v": 76391062.51,
        "f": "O14",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F16": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G16": {
        "bd": true
      },
      "H16": {
        "v": 179.2408649,
        "f": "(E16/B2)*(1-B9)",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I16": {
        "fg": "#000000",
        "bd": true
      },
      "J16": {
        "fg": "#000000",
        "bd": true
      },
      "K16": {
        "fg": "#000000",
        "bd": true
      },
      "L16": {
        "fg": "#000000",
        "bd": true
      },
      "M16": {
        "fg": "#000000",
        "bd": true
      },
      "N16": {
        "fg": "#000000",
        "bd": true
      },
      "O16": {
        "fg": "#000000",
        "bd": true
      },
      "Q16": {
        "v": "Amount Returned",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R16": {
        "v": 6082000,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "Q17": {
        "v": "Years",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R17": {
        "v": 10,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "A18": {
        "v": "Worst Scenario",
        "bg": "#FF0000",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B18": {
        "bd": true
      },
      "D18": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E18": {
        "v": 2027,
        "f": "D18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F18": {
        "v": 2028,
        "f": "E18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G18": {
        "v": 2029,
        "f": "F18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H18": {
        "v": 2030,
        "f": "G18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I18": {
        "v": 2031,
        "f": "H18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J18": {
        "v": 2032,
        "f": "I18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K18": {
        "v": 2033,
        "f": "J18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L18": {
        "v": 2034,
        "f": "K18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M18": {
        "v": 2035,
        "f": "L18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N18": {
        "v": 2036,
        "f": "M18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O18": {
        "v": "Terminal Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "Q18": {
        "fg": "#000000",
        "bd": true
      },
      "R18": {
        "bd": true
      },
      "A19": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B19": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D19": {
        "v": 6082000,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "integer",
        "cm": "Тук въвеждаме последната EBITDA, който имаме за компанията или средния за 10 годишен или 5 годишен период. Взимаме средния FCF като го сметнем с таблицата на Stock Valuation tab-а. Намираме историята на FCF в macrotrends чрез търсене в Google, копираме данните за последните 10 години и ги paste-ваме в Stock Valuation tab-а. Ако искаме да вземем последния FCF, намираме го от yahoo finance Financial таба за съответната компания и след това отиваме на Cash Flow Statement и най-долу взимаме стойността на Free Cash Flow TTM."
      },
      "E19": {
        "v": 6264460.0,
        "f": "D19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F19": {
        "v": 6452393.8,
        "f": "E19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G19": {
        "v": 6645965.614,
        "f": "F19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H19": {
        "v": 6845344.582,
        "f": "G19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I19": {
        "v": 7050704.92,
        "f": "H19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J19": {
        "v": 7262226.067,
        "f": "I19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K19": {
        "v": 7480092.85,
        "f": "J19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L19": {
        "v": 7704495.635,
        "f": "K19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M19": {
        "v": 7935630.504,
        "f": "L19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N19": {
        "v": 8173699.419,
        "f": "M19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O19": {
        "v": 8173699.419,
        "f": "N19",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q19": {
        "v": "ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R19": {
        "v": 1.235207644,
        "f": "(R16 - R15) / R15",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A20": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B20": {
        "v": 0.03,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D20": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O20": {
        "v": 122605491.3,
        "f": "O19*B22",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q20": {
        "v": "Annualized ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R20": {
        "v": 0.08375668007,
        "f": "((1+(R16-R15)/R15)^(1/R17)-1)",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A21": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B21": {
        "v": 0.03,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D21": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E21": {
        "v": 5694963.636,
        "f": "E19/(1+$B$19)^1",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F21": {
        "v": 5332556.86,
        "f": "F19/(1+$B$19)^2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G21": {
        "v": 4993212.332,
        "f": "G19/(1+$B$19)^3",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H21": {
        "v": 4675462.456,
        "f": "H19/(1+$B$19)^4",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I21": {
        "v": 4377933.027,
        "f": "I19/(1+$B$19)^5",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J21": {
        "v": 4099337.289,
        "f": "J19/(1+$B$19)^6",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K21": {
        "v": 3838470.371,
        "f": "K19/(1+$B$19)^7",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L21": {
        "v": 3594204.075,
        "f": "L19/(1+$B$19)^8",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M21": {
        "v": 3365481.997,
        "f": "M19/(1+$B$19)^9",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N21": {
        "v": 3151314.961,
        "f": "N19/(1+$B$19)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O21": {
        "v": 47269724.41,
        "f": "O20/(1+$B$19)^10",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q21": {
        "v": "Gain",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R21": {
        "v": 3361000.0,
        "f": "R16-R15",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "A22": {
        "v": "EBITDA Multiple",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B22": {
        "v": 15.0,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2",
        "cm": "Тук въвеждаме EV/EBITDA multiple-a (множителя) за продажба на компанията на 10-тата година.\n\nСтойността на този multiple взимаме за 3-те сценария според наши анализи на миналото представяне на компанията.\n\nМожем да използваме financecharts.com и да видим графично как се е движил този multiple през годините и да направим оптимистичен, среден и най-лош сценарий за нашата калкулация.\n\nEV/EBITDA множителя повлиява най-силно върху справедливата цена по този модел и трябва да бъдем внимателни какви стойности въвеждаме. Нека те да бъдат базирани на реални резултати от миналото."
      },
      "D22": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "O22": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "A23": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B23": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D23": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E23": {
        "v": 47269724.41,
        "f": "O21",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F23": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G23": {
        "bd": true
      },
      "H23": {
        "v": 110.9117481,
        "f": "(E23/B2)*(1-B23)",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I23": {
        "fg": "#000000",
        "bd": true
      },
      "J23": {
        "fg": "#000000",
        "bd": true
      },
      "K23": {
        "fg": "#000000",
        "bd": true
      },
      "L23": {
        "fg": "#000000",
        "bd": true
      },
      "M23": {
        "fg": "#000000",
        "bd": true
      },
      "N23": {
        "fg": "#000000",
        "bd": true
      },
      "O23": {
        "fg": "#000000",
        "bd": true
      },
      "D25": {
        "v": "Scenarious",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E25": {
        "v": "Weight",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F25": {
        "v": "Intrinsic Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G25": {
        "v": "IV x Weight",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H25": {
        "v": "Average Intrinsic Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I25": {
        "bd": true
      },
      "J25": {
        "fg": "#000000",
        "bd": true
      },
      "K25": {
        "bd": true
      },
      "L25": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D26": {
        "v": "Optimistic",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E26": {
        "v": 0.25,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F26": {
        "v": 356.7639015,
        "f": "H9",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G26": {
        "v": 89.19097538,
        "f": "F26*E26",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H26": {
        "v": 206.5393448,
        "f": "sum(G26:G28)",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I26": {
        "bd": true
      },
      "K26": {
        "v": "SELL",
        "f": "if(H26>E1,\"BUY\",\"SELL\")",
        "fg": "#000000",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true
      },
      "L26": {
        "bd": true
      },
      "D27": {
        "v": "Average",
        "bg": "#3C78D8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E27": {
        "v": 0.5,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F27": {
        "v": 179.2408649,
        "f": "H16",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G27": {
        "v": 89.62043243,
        "f": "F27*E27",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H27": {
        "bd": true
      },
      "I27": {
        "bd": true
      },
      "K27": {
        "bd": true
      },
      "L27": {
        "bd": true
      },
      "D28": {
        "v": "Worst",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E28": {
        "v": 0.25,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F28": {
        "v": 110.9117481,
        "f": "H23",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G28": {
        "v": 27.72793704,
        "f": "F28*E28",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H28": {
        "bd": true
      },
      "I28": {
        "bd": true
      },
      "K28": {
        "bd": true
      },
      "L28": {
        "bd": true
      },
      "D29": {
        "fg": "#000000",
        "bd": true
      },
      "E29": {
        "v": 1.0,
        "f": "sum(E26:E28)",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "L29": {
        "fg": "#000000",
        "bd": true
      },
      "D30": {
        "fg": "#000000",
        "bd": true
      },
      "F30": {
        "v": "Under / Over Valued",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 12.0,
        "al": "center",
        "bd": true
      },
      "G30": {
        "bd": true
      },
      "H30": {
        "v": -0.2437503392,
        "f": "H26/E1-1",
        "fg": "#000000",
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "I30": {
        "bd": true
      },
      "L30": {
        "fg": "#000000",
        "bd": true
      },
      "D31": {
        "fg": "#000000",
        "bd": true
      },
      "E31": {
        "fg": "#000000",
        "bd": true
      },
      "F31": {
        "bd": true
      },
      "G31": {
        "bd": true
      },
      "H31": {
        "bd": true
      },
      "I31": {
        "bd": true
      },
      "J31": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "K31": {
        "fg": "#000000",
        "bd": true
      },
      "L31": {
        "fg": "#000000",
        "bd": true
      },
      "D33": {
        "v": "Market Cap DCF",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E33": {
        "bd": true
      },
      "F33": {
        "bd": true
      },
      "G33": {
        "bd": true
      },
      "H33": {
        "bd": true
      },
      "I33": {
        "bd": true
      },
      "J33": {
        "bd": true
      },
      "K33": {
        "bd": true
      },
      "L33": {
        "bd": true
      },
      "D34": {
        "v": "Market Cap",
        "bg": "#9FC5E8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E34": {
        "v": 104680936.125,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "integer"
      },
      "F34": {
        "bd": true
      },
      "L34": {
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "D35": {
        "fg": "#000000",
        "bd": true
      },
      "L35": {
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "D36": {
        "v": "Scenarious",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E36": {
        "v": "Weight",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F36": {
        "v": "Intrinsic Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G36": {
        "v": "IV x Weight",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H36": {
        "v": "Average Intrinsic Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I36": {
        "bd": true
      },
      "L36": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D37": {
        "v": "Optimistic",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E37": {
        "v": 0.25,
        "f": "E26",
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F37": {
        "v": 152050000.0,
        "f": "E9",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G37": {
        "v": 38012500.0,
        "f": "F37*E37",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H37": {
        "v": 79222916.12,
        "f": "sum(G37:G39)*(1-B23)",
        "fg": "#000000",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I37": {
        "bd": true
      },
      "K37": {
        "v": "BUY",
        "f": "if(H37>E10,\"BUY\",\"SELL\")",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true
      },
      "L37": {
        "bd": true
      },
      "D38": {
        "v": "Average",
        "bg": "#3C78D8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E38": {
        "v": 0.5,
        "f": "E27",
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F38": {
        "v": 76391062.51,
        "f": "E16",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G38": {
        "v": 38195531.25,
        "f": "F38*E38",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H38": {
        "bd": true
      },
      "I38": {
        "bd": true
      },
      "K38": {
        "bd": true
      },
      "L38": {
        "bd": true
      },
      "D39": {
        "v": "Worst",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E39": {
        "v": 0.25,
        "f": "E28",
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F39": {
        "v": 47269724.41,
        "f": "E23",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G39": {
        "v": 11817431.1,
        "f": "F39*E39",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H39": {
        "bd": true
      },
      "I39": {
        "bd": true
      },
      "K39": {
        "bd": true
      },
      "L39": {
        "bd": true
      },
      "D40": {
        "fg": "#000000",
        "bd": true
      },
      "E40": {
        "v": 1.0,
        "f": "sum(E37:E39)",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "L40": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "D41": {
        "fg": "#000000",
        "bd": true
      },
      "F41": {
        "v": "Under / Over Valued",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 12.0,
        "al": "center",
        "bd": true
      },
      "G41": {
        "bd": true
      },
      "H41": {
        "v": -0.2431963349,
        "f": "H37/E34-1",
        "fg": "#000000",
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "I41": {
        "bd": true
      },
      "L41": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "D42": {
        "fg": "#000000",
        "bd": true
      },
      "E42": {
        "fg": "#000000",
        "bd": true
      },
      "F42": {
        "bd": true
      },
      "G42": {
        "bd": true
      },
      "H42": {
        "bd": true
      },
      "I42": {
        "bd": true
      },
      "J42": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "K42": {
        "fg": "#000000",
        "bd": true
      },
      "L42": {
        "fg": "#000000",
        "bd": true
      }
    }
  },
  {
    "id": "pe",
    "title": "PE ",
    "maxCol": 30,
    "maxRow": 31,
    "colWidths": {
      "1": 142,
      "2": 107,
      "3": 24,
      "4": 113,
      "5": 95,
      "6": 95,
      "7": 95,
      "8": 95,
      "9": 95,
      "10": 95,
      "11": 95,
      "12": 95,
      "13": 95,
      "14": 113,
      "15": 24,
      "16": 111,
      "17": 111,
      "18": 24,
      "19": 85,
      "20": 85,
      "21": 85,
      "22": 85,
      "23": 85,
      "24": 85,
      "25": 85,
      "26": 85,
      "27": 85,
      "28": 85,
      "29": 85,
      "30": 85
    },
    "merges": [
      {
        "ref": "F1:J1",
        "r1": 1,
        "c1": 6,
        "r2": 1,
        "c2": 10
      },
      {
        "ref": "A4:B4",
        "r1": 4,
        "c1": 1,
        "r2": 4,
        "c2": 2
      },
      {
        "ref": "P4:Q4",
        "r1": 4,
        "c1": 16,
        "r2": 4,
        "c2": 17
      },
      {
        "ref": "S4:AD4",
        "r1": 4,
        "c1": 19,
        "r2": 4,
        "c2": 30
      },
      {
        "ref": "P8:Q8",
        "r1": 8,
        "c1": 16,
        "r2": 8,
        "c2": 17
      },
      {
        "ref": "F9:G9",
        "r1": 9,
        "c1": 6,
        "r2": 9,
        "c2": 7
      },
      {
        "ref": "A11:B11",
        "r1": 11,
        "c1": 1,
        "r2": 11,
        "c2": 2
      },
      {
        "ref": "H25:I25",
        "r1": 25,
        "c1": 8,
        "r2": 25,
        "c2": 9
      },
      {
        "ref": "H26:I28",
        "r1": 26,
        "c1": 8,
        "r2": 28,
        "c2": 9
      },
      {
        "ref": "K26:L28",
        "r1": 26,
        "c1": 11,
        "r2": 28,
        "c2": 12
      },
      {
        "ref": "F30:G31",
        "r1": 30,
        "c1": 6,
        "r2": 31,
        "c2": 7
      },
      {
        "ref": "H30:I31",
        "r1": 30,
        "c1": 8,
        "r2": 31,
        "c2": 9
      },
      {
        "ref": "S10:T10",
        "r1": 10,
        "c1": 19,
        "r2": 10,
        "c2": 20
      },
      {
        "ref": "S11:T11",
        "r1": 11,
        "c1": 19,
        "r2": 11,
        "c2": 20
      },
      {
        "ref": "P14:Q14",
        "r1": 14,
        "c1": 16,
        "r2": 14,
        "c2": 17
      },
      {
        "ref": "F16:G16",
        "r1": 16,
        "c1": 6,
        "r2": 16,
        "c2": 7
      },
      {
        "ref": "A18:B18",
        "r1": 18,
        "c1": 1,
        "r2": 18,
        "c2": 2
      },
      {
        "ref": "P18:Q18",
        "r1": 18,
        "c1": 16,
        "r2": 18,
        "c2": 17
      },
      {
        "ref": "F23:G23",
        "r1": 23,
        "c1": 6,
        "r2": 23,
        "c2": 7
      }
    ],
    "cells": {
      "A1": {
        "v": "Company ",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B1": {
        "v": "#REF!",
        "f": "'Stock Valuation'!B2",
        "bg": "#93C47D",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D1": {
        "v": "Market Price",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E1": {
        "v": 173.26,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "F1": {
        "v": "* Въвеждайте стойности само в жълтите полета",
        "fg": "#F1C232",
        "b": true,
        "al": "center"
      },
      "K1": {
        "v": "Data",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "L1": {
        "v": "#REF!",
        "f": "Overview!G6",
        "bg": "#93C47D",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "date"
      },
      "A2": {
        "v": "EPS TTM",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B2": {
        "v": 9.65,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "A4": {
        "v": "Optimistic Scenario",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B4": {
        "bd": true
      },
      "D4": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E4": {
        "v": 2027,
        "f": "D4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F4": {
        "v": 2028,
        "f": "E4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G4": {
        "v": 2029,
        "f": "F4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H4": {
        "v": 2030,
        "f": "G4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I4": {
        "v": 2031,
        "f": "H4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J4": {
        "v": 2032,
        "f": "I4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K4": {
        "v": 2033,
        "f": "J4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L4": {
        "v": 2034,
        "f": "K4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M4": {
        "v": 2035,
        "f": "L4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N4": {
        "v": 2036,
        "f": "M4+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "P4": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q4": {
        "bd": true
      },
      "S4": {
        "v": "10 Years P/E Ratio",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "T4": {
        "bd": true
      },
      "U4": {
        "bd": true
      },
      "V4": {
        "bd": true
      },
      "W4": {
        "bd": true
      },
      "X4": {
        "bd": true
      },
      "Y4": {
        "bd": true
      },
      "Z4": {
        "bd": true
      },
      "AA4": {
        "bd": true
      },
      "AB4": {
        "bd": true
      },
      "AC4": {
        "bd": true
      },
      "AD4": {
        "bd": true
      },
      "A5": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B5": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Процентът на дисконтиране или така наречения discount rate или още Required Rate of Return. \n\nПо default можем да сложим 10%, но ако искаме да сме по-консервативни, можем да заложим по-висок процент. \n\nНе се препоръчва използване на по-малък процент от 10%, но ако вашето изискване е за по-малка от тази възвръщаемост, т.е. по-малка от 10%, тогава въведете по-малката стойност. Но като цяло никога не бих взел стойност под 8%.\n\nМожем да използваме и WACC стойността, която можем да сметнем с WACC калкулатора, но тя също не препоръчвам да бъде под 8% за утвърдени компании и минимум 10% за технологични и по-нови компании."
      },
      "D5": {
        "v": 9.65,
        "f": "B2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2",
        "cm": "Тук въвеждаме последния Free Cash Flow, който имаме за компанията или средния за 10 годишен или 5 годишен период. Взимаме средния FCF като го сметнем с таблицата на Stock Valuation tab-а. Намираме историята на FCF в macrotrends чрез търсене в Google, копираме данните за последните 10 години и ги paste-ваме в Stock Valuation tab-а. Ако искаме да вземем последния FCF, намираме го от yahoo finance Financial таба за съответната компания и след това отиваме на Cash Flow Statement и най-долу взимаме стойността на Free Cash Flow TTM."
      },
      "E5": {
        "v": 10.3255,
        "f": "D5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F5": {
        "v": 11.048285,
        "f": "E5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G5": {
        "v": 11.82166495,
        "f": "F5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H5": {
        "v": 12.6491815,
        "f": "G5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I5": {
        "v": 13.5346242,
        "f": "H5*(1+$B$6)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "J5": {
        "v": 14.4820479,
        "f": "I5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "K5": {
        "v": 15.49579125,
        "f": "J5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L5": {
        "v": 16.58049664,
        "f": "K5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "M5": {
        "v": 17.7411314,
        "f": "L5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N5": {
        "v": 18.9830106,
        "f": "M5*(1+$B$7)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "P5": {
        "v": "Amount Invested",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q5": {
        "v": 4.4,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "S5": {
        "v": "Year 0",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "T5": {
        "v": "Year 1",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "U5": {
        "v": "Year 2",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "V5": {
        "v": "Year 3",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "W5": {
        "v": "Year 4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "X5": {
        "v": "Year 5",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Y5": {
        "v": "Year 6",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Z5": {
        "v": "Year 7",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AA5": {
        "v": "Year 8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AB5": {
        "v": "Year 9",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AC5": {
        "v": "Year 10",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AD5": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "A6": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B6": {
        "v": 0.07,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D6": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N6": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "P6": {
        "v": "Amount Returned",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q6": {
        "v": 4.26,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "S6": {
        "v": 2016,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "T6": {
        "v": 2017,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "U6": {
        "v": 2018,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "V6": {
        "v": 2019,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "W6": {
        "v": 2020,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "X6": {
        "v": 2021,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Y6": {
        "v": 2022,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Z6": {
        "v": 2023,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AA6": {
        "v": 2024,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AB6": {
        "v": 2025,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AC6": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AD6": {
        "v": "Average",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "A7": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B7": {
        "v": 0.07,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D7": {
        "v": 219.5631705,
        "f": "E7/(1+$B$5)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "E7": {
        "v": 241.5194875,
        "f": "F7/(1+$B$5)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F7": {
        "v": 265.6714363,
        "f": "G7/(1+$B$5)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G7": {
        "v": 292.2385799,
        "f": "H7/(1+$B$5)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H7": {
        "v": 321.4624379,
        "f": "I7/(1+$B$5)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I7": {
        "v": 353.6086817,
        "f": "J7/(1+$B$5)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "J7": {
        "v": 388.9695498,
        "f": "K7/(1+$B$5)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "K7": {
        "v": 427.8665048,
        "f": "L7/(1+$B$5)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L7": {
        "v": 470.6531553,
        "f": "M7/(1+$B$5)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "M7": {
        "v": 517.7184709,
        "f": "N7/(1+$B$5)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N7": {
        "v": 569.4903179,
        "f": "N5*$B$8",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "P7": {
        "v": "Years",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q7": {
        "v": 5,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "S7": {
        "v": 3.82,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "number2"
      },
      "T7": {
        "v": 4.4,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "number2"
      },
      "U7": {
        "v": 2.73,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "number2"
      },
      "V7": {
        "v": 9.5,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "number2"
      },
      "W7": {
        "v": 5.57,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "number2"
      },
      "X7": {
        "v": 4.26,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "number2"
      },
      "Y7": {
        "v": 5.29,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "number2"
      },
      "Z7": {
        "v": 6.23,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "number2"
      },
      "AA7": {
        "v": 8.34,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "number2"
      },
      "AB7": {
        "v": 7.86,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "number2"
      },
      "AC7": {
        "v": 8.49,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "number2"
      },
      "AD7": {
        "v": 6.044545455,
        "f": "AVERAGE(S7:AC7)",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "number2"
      },
      "A8": {
        "v": "P/E Multiple",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B8": {
        "v": 30.0,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2",
        "cm": "Тук въвеждаме P/E multiple-a (множителя) за продажба на компанията на 10-тата година. Този множител е всъщност P/E ratio-то на компанията.\n\nСтойността на този multiple взимаме за 3-те сценария според наши анализи на миналото представяне на компанията.\n\nМожем да използваме financecharts.com и да видим графично как се е движил този multiple през годините и да направим оптимистичен, среден и най-лош сценарий за нашата калкулация.\n\nP/E ratio множителя повлиява най-силно върху справедливата цена по този модел и трябва да бъдем внимателни какви стойности въвеждаме. Нека те да бъдат базирани на реални резултати от миналото."
      },
      "D8": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N8": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "P8": {
        "fg": "#000000",
        "bd": true
      },
      "Q8": {
        "bd": true
      },
      "S8": {
        "bd": true
      },
      "T8": {
        "v": 0.1518324607,
        "f": "IF(OR(S7=\"\", S7=0, T7=\"\"), \"\", (T7-S7)/ABS(S7))",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "U8": {
        "v": -0.3795454545,
        "f": "IF(OR(T7=\"\", T7=0, U7=\"\"), \"\", (U7-T7)/ABS(T7))",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "V8": {
        "v": 2.47985348,
        "f": "IF(OR(U7=\"\", U7=0, V7=\"\"), \"\", (V7-U7)/ABS(U7))",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "W8": {
        "v": -0.4136842105,
        "f": "IF(OR(V7=\"\", V7=0, W7=\"\"), \"\", (W7-V7)/ABS(V7))",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "X8": {
        "v": -0.2351885099,
        "f": "IF(OR(W7=\"\", W7=0, X7=\"\"), \"\", (X7-W7)/ABS(W7))",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Y8": {
        "v": 0.2417840376,
        "f": "IF(OR(X7=\"\", X7=0, Y7=\"\"), \"\", (Y7-X7)/ABS(X7))",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Z8": {
        "v": 0.1776937618,
        "f": "IF(OR(Y7=\"\", Y7=0, Z7=\"\"), \"\", (Z7-Y7)/ABS(Y7))",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AA8": {
        "v": 0.3386837881,
        "f": "IF(OR(Z7=\"\", Z7=0, AA7=\"\"), \"\", (AA7-Z7)/ABS(Z7))",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AB8": {
        "v": -0.05755395683,
        "f": "IF(OR(AA7=\"\", AA7=0, AB7=\"\"), \"\", (AB7-AA7)/ABS(AA7))",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AC8": {
        "v": 0.08015267176,
        "f": "IF(OR(AB7=\"\", AB7=0, AC7=\"\"), \"\", (AC7-AB7)/ABS(AB7))",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AD8": {
        "v": 0.2384028068,
        "f": "IFERROR(AVERAGE(T8:AC8), 0)",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A9": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B9": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D9": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "E9": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F9": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G9": {
        "bd": true
      },
      "H9": {
        "v": 197.6068534,
        "f": "D7*(1-B9)",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I9": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "J9": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "K9": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "L9": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "M9": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "N9": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "P9": {
        "v": "ROI",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q9": {
        "v": -0.03181818182,
        "f": "(Q6 - Q5) / Q5",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "P10": {
        "v": "Annualized ROI",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q10": {
        "v": -0.006446209598,
        "f": "((1+(Q6-Q5)/Q5)^(1/Q7)-1)",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "S10": {
        "v": "Annual Growth Rate",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "bd": true
      },
      "T10": {
        "bd": true
      },
      "U10": {
        "v": 0.2384028068,
        "f": "IFERROR(AD8, 0)",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A11": {
        "v": "Average Scenario",
        "bg": "#4A86E8",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B11": {
        "bd": true
      },
      "D11": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E11": {
        "v": 2027,
        "f": "D11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F11": {
        "v": 2028,
        "f": "E11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G11": {
        "v": 2029,
        "f": "F11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H11": {
        "v": 2030,
        "f": "G11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I11": {
        "v": 2031,
        "f": "H11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J11": {
        "v": 2032,
        "f": "I11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K11": {
        "v": 2033,
        "f": "J11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L11": {
        "v": 2034,
        "f": "K11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M11": {
        "v": 2035,
        "f": "L11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N11": {
        "v": 2036,
        "f": "M11+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "P11": {
        "v": "Gain",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q11": {
        "v": -0.14,
        "f": "Q6-Q5",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "S11": {
        "v": "CAGR",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "bd": true
      },
      "T11": {
        "bd": true
      },
      "U11": {
        "v": 0.0831395966,
        "f": "CAGR(S7:AC7)",
        "bg": "#F9F9FF",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A12": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B12": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D12": {
        "v": 9.65,
        "f": "B2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2",
        "cm": "Тук въвеждаме последния Free Cash Flow, който имаме за компанията или средния за 10 годишен или 5 годишен период. Взимаме средния FCF като го сметнем с таблицата на Stock Valuation tab-а. Намираме историята на FCF в macrotrends чрез търсене в Google, копираме данните за последните 10 години и ги paste-ваме в Stock Valuation tab-а. Ако искаме да вземем последния FCF, намираме го от yahoo finance Financial таба за съответната компания и след това отиваме на Cash Flow Statement и най-долу взимаме стойността на Free Cash Flow TTM."
      },
      "E12": {
        "v": 10.1325,
        "f": "D12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F12": {
        "v": 10.639125,
        "f": "E12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G12": {
        "v": 11.17108125,
        "f": "F12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H12": {
        "v": 11.72963531,
        "f": "G12*(1+$B$13)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I12": {
        "v": 12.31611708,
        "f": "H12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "J12": {
        "v": 12.93192293,
        "f": "I12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "K12": {
        "v": 13.57851908,
        "f": "J12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L12": {
        "v": 14.25744503,
        "f": "K12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "M12": {
        "v": 14.97031728,
        "f": "L12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N12": {
        "v": 15.71883315,
        "f": "M12*(1+$B$14)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "A13": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B13": {
        "v": 0.05,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D13": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N13": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "A14": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B14": {
        "v": 0.05,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D14": {
        "v": 121.2058128,
        "f": "E14/(1+$B$12)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "E14": {
        "v": 133.326394,
        "f": "F14/(1+$B$12)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F14": {
        "v": 146.6590334,
        "f": "G14/(1+$B$12)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G14": {
        "v": 161.3249368,
        "f": "H14/(1+$B$12)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H14": {
        "v": 177.4574305,
        "f": "I14/(1+$B$12)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I14": {
        "v": 195.2031735,
        "f": "J14/(1+$B$12)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "J14": {
        "v": 214.7234909,
        "f": "K14/(1+$B$12)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "K14": {
        "v": 236.1958399,
        "f": "L14/(1+$B$12)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L14": {
        "v": 259.8154239,
        "f": "M14/(1+$B$12)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "M14": {
        "v": 285.7969663,
        "f": "N14/(1+$B$12)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N14": {
        "v": 314.376663,
        "f": "N12*$B$15",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "P14": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q14": {
        "bd": true
      },
      "A15": {
        "v": "P/E Multiple",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B15": {
        "v": 20.0,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2",
        "cm": "Тук въвеждаме P/E multiple-a (множителя) за продажба на компанията на 10-тата година. Този множител е всъщност P/E ratio-то на компанията.\n\nСтойността на този multiple взимаме за 3-те сценария според наши анализи на миналото представяне на компанията.\n\nМожем да използваме financecharts.com и да видим графично как се е движил този multiple през годините и да направим оптимистичен, среден и най-лош сценарий за нашата калкулация.\n\nP/E ratio множителя повлиява най-силно върху справедливата цена по този модел и трябва да бъдем внимателни какви стойности въвеждаме. Нека те да бъдат базирани на реални резултати от миналото."
      },
      "D15": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N15": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "P15": {
        "v": "Amount Invested",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "Q15": {
        "v": 4.4,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "A16": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B16": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D16": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "E16": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F16": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G16": {
        "bd": true
      },
      "H16": {
        "v": 109.0852315,
        "f": "D14*(1-B16)",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I16": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "J16": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "K16": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "L16": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "M16": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "N16": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "P16": {
        "v": "Amount Returned",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "Q16": {
        "v": 8.49,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "P17": {
        "v": "Years",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "Q17": {
        "v": 10,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "A18": {
        "v": "Worst Scenario",
        "bg": "#FF0000",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B18": {
        "bd": true
      },
      "D18": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E18": {
        "v": 2027,
        "f": "D18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F18": {
        "v": 2028,
        "f": "E18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G18": {
        "v": 2029,
        "f": "F18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H18": {
        "v": 2030,
        "f": "G18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I18": {
        "v": 2031,
        "f": "H18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J18": {
        "v": 2032,
        "f": "I18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K18": {
        "v": 2033,
        "f": "J18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L18": {
        "v": 2034,
        "f": "K18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M18": {
        "v": 2035,
        "f": "L18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N18": {
        "v": 2036,
        "f": "M18+1",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "P18": {
        "fg": "#000000",
        "bd": true
      },
      "Q18": {
        "bd": true
      },
      "A19": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B19": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D19": {
        "v": 9.65,
        "f": "B2",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2",
        "cm": "Тук въвеждаме последния Free Cash Flow, който имаме за компанията или средния за 10 годишен или 5 годишен период. Взимаме средния FCF като го сметнем с таблицата на Stock Valuation tab-а. Намираме историята на FCF в macrotrends чрез търсене в Google, копираме данните за последните 10 години и ги paste-ваме в Stock Valuation tab-а. Ако искаме да вземем последния FCF, намираме го от yahoo finance Financial таба за съответната компания и след това отиваме на Cash Flow Statement и най-долу взимаме стойността на Free Cash Flow TTM."
      },
      "E19": {
        "v": 9.9395,
        "f": "D19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F19": {
        "v": 10.237685,
        "f": "E19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G19": {
        "v": 10.54481555,
        "f": "F19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H19": {
        "v": 10.86116002,
        "f": "G19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I19": {
        "v": 11.18699482,
        "f": "H19*(1+$B$20)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "J19": {
        "v": 11.52260466,
        "f": "I19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "K19": {
        "v": 11.8682828,
        "f": "J19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L19": {
        "v": 12.22433129,
        "f": "K19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "M19": {
        "v": 12.59106122,
        "f": "L19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N19": {
        "v": 12.96879306,
        "f": "M19*(1+$B$21)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "P19": {
        "v": "ROI",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q19": {
        "v": 0.9295454545,
        "f": "(Q16 - Q15) / Q15",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A20": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B20": {
        "v": 0.03,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D20": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N20": {
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "P20": {
        "v": "Annualized ROI",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q20": {
        "v": 0.06793667525,
        "f": "((1+(Q16-Q15)/Q15)^(1/Q17)-1)",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A21": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B21": {
        "v": 0.03,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D21": {
        "v": 50.00031137,
        "f": "E21/(1+$B$19)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "E21": {
        "v": 55.0003425,
        "f": "F21/(1+$B$19)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F21": {
        "v": 60.50037675,
        "f": "G21/(1+$B$19)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G21": {
        "v": 66.55041443,
        "f": "H21/(1+$B$19)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H21": {
        "v": 73.20545587,
        "f": "I21/(1+$B$19)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I21": {
        "v": 80.52600146,
        "f": "J21/(1+$B$19)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "J21": {
        "v": 88.5786016,
        "f": "K21/(1+$B$19)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "K21": {
        "v": 97.43646176,
        "f": "L21/(1+$B$19)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L21": {
        "v": 107.1801079,
        "f": "M21/(1+$B$19)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "M21": {
        "v": 117.8981187,
        "f": "N21/(1+$B$19)",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N21": {
        "v": 129.6879306,
        "f": "N19*$B$22",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "P21": {
        "v": "Gain",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q21": {
        "v": 4.09,
        "f": "Q16-Q15",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "A22": {
        "v": "P/E Multiple",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B22": {
        "v": 10.0,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2",
        "cm": "Тук въвеждаме P/E multiple-a (множителя) за продажба на компанията на 10-тата година. Този множител е всъщност P/E ratio-то на компанията.\n\nСтойността на този multiple взимаме за 3-те сценария според наши анализи на миналото представяне на компанията.\n\nМожем да използваме financecharts.com и да видим графично как се е движил този multiple през годините и да направим оптимистичен, среден и най-лош сценарий за нашата калкулация.\n\nP/E ratio множителя повлиява най-силно върху справедливата цена по този модел и трябва да бъдем внимателни какви стойности въвеждаме. Нека те да бъдат базирани на реални резултати от миналото."
      },
      "D22": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N22": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "A23": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B23": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D23": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "E23": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F23": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G23": {
        "bd": true
      },
      "H23": {
        "v": 50.00031137,
        "f": "D21",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I23": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "J23": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "K23": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "L23": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "M23": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "N23": {
        "fg": "#000000",
        "bd": true,
        "fmt": "currency2"
      },
      "D25": {
        "v": "Scenarious",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E25": {
        "v": "Weight",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F25": {
        "v": "Intrinsic Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G25": {
        "v": "IV x Weight",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H25": {
        "v": "Average Intrinsic Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I25": {
        "bd": true
      },
      "J25": {
        "fg": "#000000",
        "bd": true
      },
      "K25": {
        "bd": true
      },
      "L25": {
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D26": {
        "v": "Optimistic",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E26": {
        "v": 0.25,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F26": {
        "v": 197.6068534,
        "f": "H9",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G26": {
        "v": 49.40171336,
        "f": "F26*E26",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H26": {
        "v": 116.4444069,
        "f": "sum(G26:G28)",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I26": {
        "bd": true
      },
      "K26": {
        "v": "SELL",
        "f": "if(H26>E1,\"BUY\",\"SELL\")",
        "fg": "#000000",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true
      },
      "L26": {
        "bd": true
      },
      "D27": {
        "v": "Average",
        "bg": "#3C78D8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E27": {
        "v": 0.5,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F27": {
        "v": 109.0852315,
        "f": "H16",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G27": {
        "v": 54.54261574,
        "f": "F27*E27",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H27": {
        "bd": true
      },
      "I27": {
        "bd": true
      },
      "K27": {
        "bd": true
      },
      "L27": {
        "bd": true
      },
      "D28": {
        "v": "Worst",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E28": {
        "v": 0.25,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F28": {
        "v": 50.00031137,
        "f": "H23",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G28": {
        "v": 12.50007784,
        "f": "F28*E28",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H28": {
        "bd": true
      },
      "I28": {
        "bd": true
      },
      "K28": {
        "bd": true
      },
      "L28": {
        "bd": true
      },
      "D29": {
        "fg": "#000000",
        "bd": true
      },
      "E29": {
        "v": 1.0,
        "f": "sum(E26:E28)",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "L29": {
        "fg": "#000000",
        "bd": true
      },
      "D30": {
        "fg": "#000000",
        "bd": true
      },
      "F30": {
        "v": "Under / Over Valued",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 12.0,
        "al": "center",
        "bd": true
      },
      "G30": {
        "bd": true
      },
      "H30": {
        "v": -0.3279210035,
        "f": "H26/E1-1",
        "fg": "#000000",
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "I30": {
        "bd": true
      },
      "L30": {
        "fg": "#000000",
        "bd": true
      },
      "D31": {
        "fg": "#000000",
        "bd": true
      },
      "E31": {
        "fg": "#000000",
        "bd": true
      },
      "F31": {
        "bd": true
      },
      "G31": {
        "bd": true
      },
      "H31": {
        "bd": true
      },
      "I31": {
        "bd": true
      },
      "J31": {
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "K31": {
        "fg": "#000000",
        "bd": true
      },
      "L31": {
        "fg": "#000000",
        "bd": true
      }
    }
  },
  {
    "id": "dividends",
    "title": "Dividends",
    "maxCol": 31,
    "maxRow": 31,
    "colWidths": {
      "1": 142,
      "2": 107,
      "3": 24,
      "4": 113,
      "5": 95,
      "6": 95,
      "7": 95,
      "8": 95,
      "9": 95,
      "10": 95,
      "11": 95,
      "12": 95,
      "13": 95,
      "14": 95,
      "15": 113,
      "16": 24,
      "17": 111,
      "18": 111,
      "19": 24,
      "20": 85,
      "21": 85,
      "22": 85,
      "23": 85,
      "24": 85,
      "25": 85,
      "26": 85,
      "27": 85,
      "28": 85,
      "29": 85,
      "30": 85,
      "31": 85
    },
    "merges": [
      {
        "ref": "F1:J1",
        "r1": 1,
        "c1": 6,
        "r2": 1,
        "c2": 10
      },
      {
        "ref": "A4:B4",
        "r1": 4,
        "c1": 1,
        "r2": 4,
        "c2": 2
      },
      {
        "ref": "Q4:R4",
        "r1": 4,
        "c1": 17,
        "r2": 4,
        "c2": 18
      },
      {
        "ref": "T4:AE4",
        "r1": 4,
        "c1": 20,
        "r2": 4,
        "c2": 31
      },
      {
        "ref": "Q8:R8",
        "r1": 8,
        "c1": 17,
        "r2": 8,
        "c2": 18
      },
      {
        "ref": "F9:G9",
        "r1": 9,
        "c1": 6,
        "r2": 9,
        "c2": 7
      },
      {
        "ref": "A11:B11",
        "r1": 11,
        "c1": 1,
        "r2": 11,
        "c2": 2
      },
      {
        "ref": "H25:I25",
        "r1": 25,
        "c1": 8,
        "r2": 25,
        "c2": 9
      },
      {
        "ref": "H26:I28",
        "r1": 26,
        "c1": 8,
        "r2": 28,
        "c2": 9
      },
      {
        "ref": "K26:L28",
        "r1": 26,
        "c1": 11,
        "r2": 28,
        "c2": 12
      },
      {
        "ref": "F30:G31",
        "r1": 30,
        "c1": 6,
        "r2": 31,
        "c2": 7
      },
      {
        "ref": "H30:I31",
        "r1": 30,
        "c1": 8,
        "r2": 31,
        "c2": 9
      },
      {
        "ref": "T10:U10",
        "r1": 10,
        "c1": 20,
        "r2": 10,
        "c2": 21
      },
      {
        "ref": "T11:U11",
        "r1": 11,
        "c1": 20,
        "r2": 11,
        "c2": 21
      },
      {
        "ref": "Q14:R14",
        "r1": 14,
        "c1": 17,
        "r2": 14,
        "c2": 18
      },
      {
        "ref": "F16:G16",
        "r1": 16,
        "c1": 6,
        "r2": 16,
        "c2": 7
      },
      {
        "ref": "A18:B18",
        "r1": 18,
        "c1": 1,
        "r2": 18,
        "c2": 2
      },
      {
        "ref": "Q18:R18",
        "r1": 18,
        "c1": 17,
        "r2": 18,
        "c2": 18
      },
      {
        "ref": "F23:G23",
        "r1": 23,
        "c1": 6,
        "r2": 23,
        "c2": 7
      }
    ],
    "cells": {
      "A1": {
        "v": "Company ",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B1": {
        "v": "#REF!",
        "f": "'Stock Valuation'!B2",
        "bg": "#93C47D",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D1": {
        "v": "Market Price",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E1": {
        "v": 0.0,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "F1": {
        "v": "* Въвеждайте стойности само в жълтите полета",
        "fg": "#F1C232",
        "b": true,
        "al": "center"
      },
      "K1": {
        "v": "Data",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "L1": {
        "v": "#REF!",
        "f": "Overview!G6",
        "bg": "#93C47D",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "date"
      },
      "A2": {
        "v": "Dividend per share",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B2": {
        "v": 0.0,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G3": {
        "v": "."
      },
      "A4": {
        "v": "Optimistic Scenario",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B4": {
        "bd": true
      },
      "D4": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E4": {
        "v": 2027,
        "f": "D4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F4": {
        "v": 2028,
        "f": "E4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G4": {
        "v": 2029,
        "f": "F4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H4": {
        "v": 2030,
        "f": "G4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I4": {
        "v": 2031,
        "f": "H4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J4": {
        "v": 2032,
        "f": "I4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K4": {
        "v": 2033,
        "f": "J4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L4": {
        "v": 2034,
        "f": "K4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M4": {
        "v": 2035,
        "f": "L4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N4": {
        "v": 2036,
        "f": "M4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O4": {
        "v": "Terminal Value",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "Q4": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R4": {
        "bd": true
      },
      "T4": {
        "v": "10 Years FCF",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "U4": {
        "bd": true
      },
      "V4": {
        "bd": true
      },
      "W4": {
        "bd": true
      },
      "X4": {
        "bd": true
      },
      "Y4": {
        "bd": true
      },
      "Z4": {
        "bd": true
      },
      "AA4": {
        "bd": true
      },
      "AB4": {
        "bd": true
      },
      "AC4": {
        "bd": true
      },
      "AD4": {
        "bd": true
      },
      "AE4": {
        "bd": true
      },
      "A5": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B5": {
        "v": 0.1,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Процентът на дисконтиране или така наречения discount rate или още Required Rate of Return. \n\nПо default можем да сложим 10%, но ако искаме да сме по-консервативни, можем да заложим по-висок процент. \n\nНе се препоръчва използване на по-малък процент от 10%, но ако вашето изискване е за по-малка от тази възвръщаемост, т.е. по-малка от 10%, тогава въведете по-малката стойност. Но като цяло никога не бих взел стойност под 8%.\n\nМожем да използваме и WACC стойността, която можем да сметнем с WACC калкулатора, но тя също не препоръчвам да бъде под 8% за утвърдени компании и минимум 10% за технологични и по-нови компании."
      },
      "D5": {
        "v": 0.0,
        "f": "B2",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "E5": {
        "v": 0.0,
        "f": "D5*(1+$B$6)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F5": {
        "v": 0.0,
        "f": "E5*(1+$B$6)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G5": {
        "v": 0.0,
        "f": "F5*(1+$B$6)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H5": {
        "v": 0.0,
        "f": "G5*(1+$B$6)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I5": {
        "v": 0.0,
        "f": "H5*(1+$B$6)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "J5": {
        "v": 0.0,
        "f": "I5*(1+$B$7)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "K5": {
        "v": 0.0,
        "f": "J5*(1+$B$7)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L5": {
        "v": 0.0,
        "f": "K5*(1+$B$7)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "M5": {
        "v": 0.0,
        "f": "L5*(1+$B$7)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N5": {
        "v": 0.0,
        "f": "M5*(1+$B$7)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "O5": {
        "v": 0.0,
        "f": "N5",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Q5": {
        "v": "Amount Invested",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R5": {
        "v": 4.19,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "T5": {
        "v": "Year 0",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "U5": {
        "v": "Year 1",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "V5": {
        "v": "Year 2",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "W5": {
        "v": "Year 3",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "X5": {
        "v": "Year 4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Y5": {
        "v": "Year 5",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Z5": {
        "v": "Year 6",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AA5": {
        "v": "Year 7",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AB5": {
        "v": "Year 8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AC5": {
        "v": "Year 9",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AD5": {
        "v": "Year 10",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AE5": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "A6": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B6": {
        "v": 0.0,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Въвеждаме с колко компанията ще покачва дивидента си най-оптимистично за следващите 5 години. \n\nТази стойност получаваме от миналото представяне на компанията за последните 10 години. Взимаме я от dividend.com или друг уебсайт, който предоставя таква информация.\n\nРедно е този оптимистичен вариант да бъде въведен от нас след като сме направили анализ и оценка на бъдещото развитие на компанията. \n\nВинаги е добре да бъдем по-консервативни в прогнозите си. Затова, ако компанията е покачвала дивидента си с 15% на година средно за последните 10 години, не взимаме по-голям от този процент и дори използваме по-малък такъв."
      },
      "D6": {
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O6": {
        "v": 0.0,
        "f": "(N5*B8)",
        "bg": "#FF0000",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q6": {
        "v": "Amount Returned",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R6": {
        "v": 5.2,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "T6": {
        "v": 2016,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "U6": {
        "v": 2017,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "V6": {
        "v": 2018,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "W6": {
        "v": 2019,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "X6": {
        "v": 2020,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Y6": {
        "v": 2021,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Z6": {
        "v": 2022,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AA6": {
        "v": 2023,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AB6": {
        "v": 2024,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AC6": {
        "v": 2025,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AD6": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "AE6": {
        "v": "Average",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "A7": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B7": {
        "v": 0.0,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D7": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E7": {
        "v": 0.0,
        "f": "E5/(1+$B$5)^1",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F7": {
        "v": 0.0,
        "f": "F5/(1+$B$5)^2",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G7": {
        "v": 0.0,
        "f": "G5/(1+$B$5)^3",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H7": {
        "v": 0.0,
        "f": "H5/(1+$B$5)^4",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I7": {
        "v": 0.0,
        "f": "I5/(1+$B$5)^5",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "J7": {
        "v": 0.0,
        "f": "J5/(1+$B$5)^6",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "K7": {
        "v": 0.0,
        "f": "K5/(1+$B$5)^7",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L7": {
        "v": 0.0,
        "f": "L5/(1+$B$5)^8",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "M7": {
        "v": 0.0,
        "f": "M5/(1+$B$5)^9",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N7": {
        "v": 0.0,
        "f": "N5/(1+$B$5)^10",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "O7": {
        "v": 0.0,
        "f": "O6/(1+$B$5)^10",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Q7": {
        "v": "Years",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R7": {
        "v": 5,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "T7": {
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "U7": {
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "V7": {
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "W7": {
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "X7": {
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "Y7": {
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "Z7": {
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AA7": {
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AB7": {
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AC7": {
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AD7": {
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "AE7": {
        "v": "#DIV/0!",
        "f": "AVERAGE(T7:AD7)",
        "bg": "#F9F9FF",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "A8": {
        "v": "Dividend multiple",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "cm": "Ще вземем Мултипъл когато цента е по висока и Dividend yield е по-нисък.\n\nВзимаме мултипъл когато ценат е висока"
      },
      "B8": {
        "v": 0.0,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2",
        "cm": "Тук въвеждаме дивидентния multiple (множителя) за продажба на компанията на 10-тата година. Този множител можем да вземем по 2 начина:\n\nНачин 1: Разделяме текущата цена на акцията на дивидента за 1 дял и полученият резултат е дивидентният multiple. Например, ако една компания изплаща $1.50 дивидент и 1 акция струва $50, то 50 / 1.50 = 33. \nТози резултат взимаме като множител за продажба, като Dividend Multiple.\n\nНачин 2: Взимаме средна стойност на dividend yield на компанията за последните 10 години и я разделяме на 100. \nАко например една компания има среден dividend yield за последното десетилетие 2.9%, то 100 / 2.9 = 34. \nМожем да намерим средни стойоности на dividend yield на financecharts.com или други подобни уебсайтове.\n\nСтойността на този multiple взимаме за 3-те сценария според наши анализи на миналото представяне на компанията.\n\nМожем да използваме financecharts.com и да видим графично как се е движил този multiple през годините и какъв е бил той според цената на акцията и да направим оптимистичен, среден и най-лош сценарий за нашата калкулация.\n\nDividend multiple-a повлиява най-силно върху справедливата цена по този модел и трябва да бъдем внимателни какви стойности въвеждаме. Нека те да бъдат базирани на реални резултати от миналото."
      },
      "D8": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "O8": {
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Q8": {
        "fg": "#000000",
        "bd": true
      },
      "R8": {
        "bd": true
      },
      "T8": {
        "bd": true
      },
      "U8": {
        "f": "IF(OR(T7=\"\", T7=0, U7=\"\"), \"\", (U7-T7)/ABS(T7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "V8": {
        "f": "IF(OR(U7=\"\", U7=0, V7=\"\"), \"\", (V7-U7)/ABS(U7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "W8": {
        "f": "IF(OR(V7=\"\", V7=0, W7=\"\"), \"\", (W7-V7)/ABS(V7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "X8": {
        "f": "IF(OR(W7=\"\", W7=0, X7=\"\"), \"\", (X7-W7)/ABS(W7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Y8": {
        "f": "IF(OR(X7=\"\", X7=0, Y7=\"\"), \"\", (Y7-X7)/ABS(X7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Z8": {
        "f": "IF(OR(Y7=\"\", Y7=0, Z7=\"\"), \"\", (Z7-Y7)/ABS(Y7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AA8": {
        "f": "IF(OR(Z7=\"\", Z7=0, AA7=\"\"), \"\", (AA7-Z7)/ABS(Z7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AB8": {
        "f": "IF(OR(AA7=\"\", AA7=0, AB7=\"\"), \"\", (AB7-AA7)/ABS(AA7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AC8": {
        "f": "IF(OR(AB7=\"\", AB7=0, AC7=\"\"), \"\", (AC7-AB7)/ABS(AB7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AD8": {
        "f": "IF(OR(AC7=\"\", AC7=0, AD7=\"\"), \"\", (AD7-AC7)/ABS(AC7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "AE8": {
        "v": 0.0,
        "f": "IFERROR(AVERAGE(U8:AD8), 0)",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A9": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B9": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D9": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E9": {
        "v": 0.0,
        "f": "SUM(E7:O7)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F9": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G9": {
        "bd": true
      },
      "H9": {
        "v": 0.0,
        "f": "E9*(1-B9)",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I9": {
        "bd": true
      },
      "J9": {
        "bd": true
      },
      "K9": {
        "bd": true
      },
      "L9": {
        "bd": true
      },
      "M9": {
        "bd": true
      },
      "N9": {
        "bd": true
      },
      "O9": {
        "bd": true
      },
      "Q9": {
        "v": "ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R9": {
        "v": 0.2410501193,
        "f": "(R6 - R5) / R5",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Q10": {
        "v": "Annualized ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R10": {
        "v": 0.04413790989,
        "f": "((1+(R6-R5)/R5)^(1/R7)-1)",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "T10": {
        "v": "Annual Growth Rate",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "bd": true
      },
      "U10": {
        "bd": true
      },
      "V10": {
        "v": 0.0,
        "f": "IFERROR(AE8, 0)",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A11": {
        "v": "Average Scenario",
        "bg": "#6FA8DC",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B11": {
        "bd": true
      },
      "D11": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E11": {
        "v": 2027,
        "f": "D11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F11": {
        "v": 2028,
        "f": "E11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G11": {
        "v": 2029,
        "f": "F11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H11": {
        "v": 2030,
        "f": "G11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I11": {
        "v": 2031,
        "f": "H11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J11": {
        "v": 2032,
        "f": "I11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K11": {
        "v": 2033,
        "f": "J11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L11": {
        "v": 2034,
        "f": "K11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M11": {
        "v": 2035,
        "f": "L11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N11": {
        "v": 2036,
        "f": "M11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O11": {
        "v": "Terminal Value",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "Q11": {
        "v": "Gain",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R11": {
        "v": 1.01,
        "f": "R6-R5",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "T11": {
        "v": "CAGR",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "bd": true
      },
      "U11": {
        "bd": true
      },
      "V11": {
        "v": "#N/A",
        "f": "CAGR(T7:AD7)",
        "bg": "#F9F9FF",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A12": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B12": {
        "v": 0.1,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Процентът на дисконтиране или така наречения discount rate или още Required Rate of Return. \n\nПо default можем да сложим 10%, но ако искаме да сме по-консервативни, можем да заложим по-висок процент. \n\nНе се препоръчва използване на по-малък процент от 10%, но ако вашето изискване е за по-малка от тази възвръщаемост, т.е. по-малка от 10%, тогава въведете по-малката стойност. Но като цяло никога не бих взел стойност под 8%.\n\nМожем да използваме и WACC стойността, която можем да сметнем с WACC калкулатора, но тя също не препоръчвам да бъде под 8% за утвърдени компании и минимум 10% за технологични и по-нови компании."
      },
      "D12": {
        "v": 0.0,
        "f": "B2",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E12": {
        "v": 0.0,
        "f": "D12*(1+$B$13)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F12": {
        "v": 0.0,
        "f": "E12*(1+$B$13)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G12": {
        "v": 0.0,
        "f": "F12*(1+$B$13)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H12": {
        "v": 0.0,
        "f": "G12*(1+$B$13)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I12": {
        "v": 0.0,
        "f": "H12*(1+$B$13)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "J12": {
        "v": 0.0,
        "f": "I12*(1+$B$14)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "K12": {
        "v": 0.0,
        "f": "J12*(1+$B$14)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L12": {
        "v": 0.0,
        "f": "K12*(1+$B$14)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "M12": {
        "v": 0.0,
        "f": "L12*(1+$B$14)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N12": {
        "v": 0.0,
        "f": "M12*(1+$B$14)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "O12": {
        "v": 0.0,
        "f": "N12",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "A13": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B13": {
        "v": 0.0,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Въвеждаме с колко компанията ще покачва дивидента си най-оптимистично за следващите 5 години. \n\nТази стойност получаваме от миналото представяне на компанията за последните 10 години. Взимаме я от dividend.com или друг уебсайт, който предоставя таква информация.\n\nРедно е този оптимистичен вариант да бъде въведен от нас след като сме направили анализ и оценка на бъдещото развитие на компанията. \n\nВинаги е добре да бъдем по-консервативни в прогнозите си. Затова, ако компанията е покачвала дивидента си с 15% на година средно за последните 10 години, не взимаме по-голям от този процент и дори използваме по-малък такъв."
      },
      "D13": {
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O13": {
        "v": 0.0,
        "f": "(N12*B15)",
        "bg": "#FF0000",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "A14": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B14": {
        "v": 0.0,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D14": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E14": {
        "v": 0.0,
        "f": "E12/(1+$B$12)^1",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F14": {
        "v": 0.0,
        "f": "F12/(1+$B$12)^2",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G14": {
        "v": 0.0,
        "f": "G12/(1+$B$12)^3",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H14": {
        "v": 0.0,
        "f": "H12/(1+$B$12)^4",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I14": {
        "v": 0.0,
        "f": "I12/(1+$B$12)^5",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "J14": {
        "v": 0.0,
        "f": "J12/(1+$B$12)^6",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "K14": {
        "v": 0.0,
        "f": "K12/(1+$B$12)^7",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L14": {
        "v": 0.0,
        "f": "L12/(1+$B$12)^8",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "M14": {
        "v": 0.0,
        "f": "M12/(1+$B$12)^9",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N14": {
        "v": 0.0,
        "f": "N12/(1+$B$12)^10",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "O14": {
        "v": 0.0,
        "f": "O13/(1+$B$12)^10",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Q14": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R14": {
        "bd": true
      },
      "A15": {
        "v": "Dividend multiple",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "cm": "Средния Dividend yield за последните 10 годни"
      },
      "B15": {
        "v": 0.0,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2",
        "cm": "Тук въвеждаме дивидентния multiple (множителя) за продажба на компанията на 10-тата година. Този множител можем да вземем по 2 начина:\n\nНачин 1: Разделяме текущата цена на акцията на дивидента за 1 дял и полученият резултат е дивидентният multiple. Например, ако една компания изплаща $1.50 дивидент и 1 акция струва $50, то 50 / 1.50 = 33. Този резултат взимаме като множител за продажба, като Dividend Multiple.\n\nНачин 2: Взимаме средна стойност на dividend yield на компанията за последните 10 години и я разделяме на 100.\nАко например една компания има среден dividend yield за последното десетилетие 2.9%, то 100 / 2.9 = 34.48 Можем да намерим средни стойоности на dividend yield на financecharts.com или други подобни уебсайтове.\n\nСтойността на този multiple взимаме за 3-те сценария според наши анализи на миналото представяне на компанията.\n\nМожем да използваме financecharts.com и да видим графично как се е движил този multiple през годините и какъв е бил той според цената на акцията и да направим оптимистичен, среден и най-лош сценарий за нашата калкулация.\n\nDividend multiple-a повлиява най-силно върху справедливата цена по този модел и трябва да бъдем внимателни какви стойности въвеждаме. Нека те да бъдат базирани на реални резултати от миналото."
      },
      "D15": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "O15": {
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Q15": {
        "v": "Amount Invested",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R15": {
        "v": 2.95,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "A16": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B16": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D16": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E16": {
        "v": 0.0,
        "f": "SUM(E14:O14)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F16": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G16": {
        "bd": true
      },
      "H16": {
        "v": 0.0,
        "f": "E16*(1-B16)",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I16": {
        "bd": true
      },
      "J16": {
        "bd": true
      },
      "K16": {
        "bd": true
      },
      "L16": {
        "bd": true
      },
      "M16": {
        "bd": true
      },
      "N16": {
        "bd": true
      },
      "O16": {
        "bd": true
      },
      "Q16": {
        "v": "Amount Returned",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R16": {
        "v": 5.2,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "Q17": {
        "v": "Years",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "R17": {
        "v": 10,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "A18": {
        "v": "Worst Scenario",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B18": {
        "bd": true
      },
      "D18": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E18": {
        "v": 2027,
        "f": "D18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F18": {
        "v": 2028,
        "f": "E18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G18": {
        "v": 2029,
        "f": "F18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H18": {
        "v": 2030,
        "f": "G18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I18": {
        "v": 2031,
        "f": "H18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "J18": {
        "v": 2032,
        "f": "I18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "K18": {
        "v": 2033,
        "f": "J18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "L18": {
        "v": 2034,
        "f": "K18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "M18": {
        "v": 2035,
        "f": "L18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "N18": {
        "v": 2036,
        "f": "M18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "O18": {
        "v": "Terminal Value",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "Q18": {
        "fg": "#000000",
        "bd": true
      },
      "R18": {
        "bd": true
      },
      "A19": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B19": {
        "v": 0.1,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Процентът на дисконтиране или така наречения discount rate или още Required Rate of Return. \n\nПо default можем да сложим 10%, но ако искаме да сме по-консервативни, можем да заложим по-висок процент. \n\nНе се препоръчва използване на по-малък процент от 10%, но ако вашето изискване е за по-малка от тази възвръщаемост, т.е. по-малка от 10%, тогава въведете по-малката стойност. Но като цяло никога не бих взел стойност под 8%.\n\nМожем да използваме и WACC стойността, която можем да сметнем с WACC калкулатора, но тя също не препоръчвам да бъде под 8% за утвърдени компании и минимум 10% за технологични и по-нови компании."
      },
      "D19": {
        "v": 0.0,
        "f": "B2",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "E19": {
        "v": 0.0,
        "f": "D19*(1+$B$20)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F19": {
        "v": 0.0,
        "f": "E19*(1+$B$20)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G19": {
        "v": 0.0,
        "f": "F19*(1+$B$20)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H19": {
        "v": 0.0,
        "f": "G19*(1+$B$20)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I19": {
        "v": 0.0,
        "f": "H19*(1+$B$20)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "J19": {
        "v": 0.0,
        "f": "I19*(1+$B$21)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "K19": {
        "v": 0.0,
        "f": "J19*(1+$B$21)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L19": {
        "v": 0.0,
        "f": "K19*(1+$B$21)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "M19": {
        "v": 0.0,
        "f": "L19*(1+$B$21)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N19": {
        "v": 0.0,
        "f": "M19*(1+$B$21)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "O19": {
        "v": 0.0,
        "f": "N19",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Q19": {
        "v": "ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R19": {
        "v": 0.7627118644,
        "f": "(R16 - R15) / R15",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A20": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B20": {
        "v": 0.0,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Въвеждаме с колко компанията ще покачва дивидента си най-оптимистично за следващите 5 години. \n\nТази стойност получаваме от миналото представяне на компанията за последните 10 години. Взимаме я от dividend.com или друг уебсайт, който предоставя таква информация.\n\nРедно е този оптимистичен вариант да бъде въведен от нас след като сме направили анализ и оценка на бъдещото развитие на компанията. \n\nВинаги е добре да бъдем по-консервативни в прогнозите си. Затова, ако компанията е покачвала дивидента си с 15% на година средно за последните 10 години, не взимаме по-голям от този процент и дори използваме по-малък такъв."
      },
      "D20": {
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "O20": {
        "v": 0.0,
        "f": "(N19*B22)",
        "bg": "#FF0000",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "Q20": {
        "v": "Annualized ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R20": {
        "v": 0.05832275201,
        "f": "((1+(R16-R15)/R15)^(1/R17)-1)",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A21": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B21": {
        "v": 0.0,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D21": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E21": {
        "v": 0.0,
        "f": "E19/(1+$B$19)^1",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F21": {
        "v": 0.0,
        "f": "F19/(1+$B$19)^2",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G21": {
        "v": 0.0,
        "f": "G19/(1+$B$19)^3",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H21": {
        "v": 0.0,
        "f": "H19/(1+$B$19)^4",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I21": {
        "v": 0.0,
        "f": "I19/(1+$B$19)^5",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "J21": {
        "v": 0.0,
        "f": "J19/(1+$B$19)^6",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "K21": {
        "v": 0.0,
        "f": "K19/(1+$B$19)^7",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L21": {
        "v": 0.0,
        "f": "L19/(1+$B$19)^8",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "M21": {
        "v": 0.0,
        "f": "M19/(1+$B$19)^9",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N21": {
        "v": 0.0,
        "f": "N19/(1+$B$19)^10",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "O21": {
        "v": 0.0,
        "f": "O20/(1+$B$5)^10",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Q21": {
        "v": "Gain",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R21": {
        "v": 2.25,
        "f": "R16-R15",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "A22": {
        "v": "Dividend multiple",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "cm": "Ще вземем Мултипъл когато цента е по ниска и Dividend yield е по-висок"
      },
      "B22": {
        "v": 0.0,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2",
        "cm": "Тук въвеждаме дивидентния multiple (множителя) за продажба на компанията на 10-тата година. Този множител можем да вземем по 2 начина:\n\nНачин 1: Разделяме текущата цена на акцията на дивидента за 1 дял и полученият резултат е дивидентният multiple. \nНапример, ако една компания изплаща $1.50 дивидент и 1 акция струва $50, то 50 / 1.50 = 33. Този резултат взимаме като множител за продажба, като Dividend Multiple.\n\nНачин 2: Взимаме средна стойност на dividend yield на компанията за последните 10 години и я разделяме на 100. Ако например една компания има среден dividend yield за последното десетилетие 2.9%, то 100 / 2.9 = 34. Можем да намерим средни стойоности на dividend yield на financecharts.com или други подобни уебсайтове.\n\nСтойността на този multiple взимаме за 3-те сценария според наши анализи на миналото представяне на компанията.\n\nМожем да използваме financecharts.com и да видим графично как се е движил този multiple през годините и какъв е бил той според цената на акцията и да направим оптимистичен, среден и най-лош сценарий за нашата калкулация.\n\nDividend multiple-a повлиява най-силно върху справедливата цена по този модел и трябва да бъдем внимателни какви стойности въвеждаме. Нека те да бъдат базирани на реални резултати от миналото."
      },
      "D22": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "O22": {
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "A23": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B23": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "D23": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E23": {
        "v": 0.0,
        "f": "SUM(E21:O21)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F23": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G23": {
        "bd": true
      },
      "H23": {
        "v": 0.0,
        "f": "E23*(1-B23)",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I23": {
        "bd": true
      },
      "J23": {
        "bd": true
      },
      "K23": {
        "bd": true
      },
      "L23": {
        "bd": true
      },
      "M23": {
        "bd": true
      },
      "N23": {
        "bd": true
      },
      "O23": {
        "bd": true
      },
      "D25": {
        "v": "Scenarious",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E25": {
        "v": "Weight",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F25": {
        "v": "Intrinsic Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G25": {
        "v": "IV x Weight",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H25": {
        "v": "Average Intrinsic Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I25": {
        "bd": true
      },
      "J25": {
        "fg": "#FFFFFF",
        "bd": true
      },
      "K25": {
        "bd": true
      },
      "L25": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D26": {
        "v": "Optimistic",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E26": {
        "v": 0.2,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F26": {
        "v": 0.0,
        "f": "H9",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G26": {
        "v": 0.0,
        "f": "F26*E26",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H26": {
        "v": 0.0,
        "f": "sum(G26:G28)",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I26": {
        "bd": true
      },
      "K26": {
        "v": "SELL",
        "f": "if(H26>E1,\"BUY\",\"SELL\")",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true
      },
      "L26": {
        "bd": true
      },
      "D27": {
        "v": "Average",
        "bg": "#6FA8DC",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E27": {
        "v": 0.6,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F27": {
        "v": 0.0,
        "f": "H16",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G27": {
        "v": 0.0,
        "f": "F27*E27",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H27": {
        "bd": true
      },
      "I27": {
        "bd": true
      },
      "K27": {
        "bd": true
      },
      "L27": {
        "bd": true
      },
      "D28": {
        "v": "Worst",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E28": {
        "v": 0.2,
        "bg": "#FFD966",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F28": {
        "v": 0.0,
        "f": "H23",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G28": {
        "v": 0.0,
        "f": "F28*E28",
        "fg": "#000000",
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H28": {
        "bd": true
      },
      "I28": {
        "bd": true
      },
      "K28": {
        "bd": true
      },
      "L28": {
        "bd": true
      },
      "D29": {
        "bd": true
      },
      "E29": {
        "v": 1.0,
        "f": "sum(E26:E28)",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "L29": {
        "bd": true
      },
      "D30": {
        "bd": true
      },
      "F30": {
        "v": "Under / Over Valued",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 12.0,
        "al": "center",
        "bd": true
      },
      "G30": {
        "bd": true
      },
      "H30": {
        "v": "#DIV/0!",
        "f": "H26/E1-1",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "I30": {
        "bd": true
      },
      "L30": {
        "bd": true
      },
      "D31": {
        "bd": true
      },
      "E31": {
        "bd": true
      },
      "F31": {
        "bd": true
      },
      "G31": {
        "bd": true
      },
      "H31": {
        "bd": true
      },
      "I31": {
        "bd": true
      },
      "J31": {
        "fg": "#FFFFFF",
        "al": "center",
        "bd": true
      },
      "K31": {
        "bd": true
      },
      "L31": {
        "bd": true
      }
    }
  },
  {
    "id": "peterLynch",
    "title": "Peter Lynch Fair Value",
    "maxCol": 22,
    "maxRow": 28,
    "colWidths": {
      "1": 24,
      "2": 113,
      "3": 95,
      "4": 95,
      "5": 95,
      "6": 95,
      "7": 95,
      "8": 95,
      "9": 113,
      "10": 24,
      "11": 85,
      "12": 85,
      "13": 85,
      "14": 85,
      "15": 85,
      "16": 85,
      "17": 85,
      "18": 85,
      "19": 85,
      "20": 85,
      "21": 85,
      "22": 85
    },
    "merges": [
      {
        "ref": "B4:I4",
        "r1": 4,
        "c1": 2,
        "r2": 4,
        "c2": 9
      },
      {
        "ref": "K4:V4",
        "r1": 4,
        "c1": 11,
        "r2": 4,
        "c2": 22
      },
      {
        "ref": "B8:I8",
        "r1": 8,
        "c1": 2,
        "r2": 8,
        "c2": 9
      },
      {
        "ref": "K10:L10",
        "r1": 10,
        "c1": 11,
        "r2": 10,
        "c2": 12
      },
      {
        "ref": "K11:L11",
        "r1": 11,
        "c1": 11,
        "r2": 11,
        "c2": 12
      },
      {
        "ref": "I13:I14",
        "r1": 13,
        "c1": 9,
        "r2": 14,
        "c2": 9
      }
    ],
    "cells": {
      "B4": {
        "v": "Peter Lynch Fair Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center"
      },
      "K4": {
        "v": "10 Years Net Income",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L4": {
        "bd": true
      },
      "M4": {
        "bd": true
      },
      "N4": {
        "bd": true
      },
      "O4": {
        "bd": true
      },
      "P4": {
        "bd": true
      },
      "Q4": {
        "bd": true
      },
      "R4": {
        "bd": true
      },
      "S4": {
        "bd": true
      },
      "T4": {
        "bd": true
      },
      "U4": {
        "bd": true
      },
      "V4": {
        "bd": true
      },
      "K5": {
        "v": "Year 0",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "L5": {
        "v": "Year 1",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "M5": {
        "v": "Year 2",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "N5": {
        "v": "Year 3",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "O5": {
        "v": "Year 4",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "P5": {
        "v": "Year 5",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "Q5": {
        "v": "Year 6",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R5": {
        "v": "Year 7",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "S5": {
        "v": "Year 8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "T5": {
        "v": "Year 9",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "U5": {
        "v": "Year 10",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "V5": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B6": {
        "v": "Tiker",
        "bg": "#B3CEFB",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "C6": {
        "v": "#REF!",
        "f": "Overview!B5",
        "bg": "#B6D7A8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "H6": {
        "v": "Data",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "I6": {
        "v": "#REF!",
        "f": "Overview!G6",
        "bg": "#B6D7A8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "date"
      },
      "K6": {
        "v": 2016,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "L6": {
        "v": 2017,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "M6": {
        "v": 2018,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "N6": {
        "v": 2019,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "O6": {
        "v": 2020,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "P6": {
        "v": 2021,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q6": {
        "v": 2022,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "R6": {
        "v": 2023,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "S6": {
        "v": 2024,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "T6": {
        "v": 2025,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "U6": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "V6": {
        "v": "Average",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "K7": {
        "v": 3230000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "L7": {
        "v": 6686000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "M7": {
        "v": 6590000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "N7": {
        "v": 8486000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "O7": {
        "v": 10231000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "P7": {
        "v": 13230000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "Q7": {
        "v": 12472000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "R7": {
        "v": 11857000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "S7": {
        "v": 10901000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "T7": {
        "v": 12188000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "U7": {
        "v": 14859000,
        "bg": "#FFD966",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "V7": {
        "v": 14192000,
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "integer"
      },
      "B8": {
        "v": "Historical Earnings",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center"
      },
      "K8": {
        "bd": true
      },
      "L8": {
        "v": 1.06996904,
        "f": "IF(OR(K7=\"\", K7=0, L7=\"\"), \"\", (L7-K7)/ABS(K7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "M8": {
        "v": -0.01435836075,
        "f": "IF(OR(L7=\"\", L7=0, M7=\"\"), \"\", (M7-L7)/ABS(L7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "N8": {
        "v": 0.2877086495,
        "f": "IF(OR(M7=\"\", M7=0, N7=\"\"), \"\", (N7-M7)/ABS(M7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "O8": {
        "v": 0.205632807,
        "f": "IF(OR(N7=\"\", N7=0, O7=\"\"), \"\", (O7-N7)/ABS(N7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "P8": {
        "v": 0.2931287264,
        "f": "IF(OR(O7=\"\", O7=0, P7=\"\"), \"\", (P7-O7)/ABS(O7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "Q8": {
        "v": -0.05729402872,
        "f": "IF(OR(P7=\"\", P7=0, Q7=\"\"), \"\", (Q7-P7)/ABS(P7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "R8": {
        "v": -0.04931045542,
        "f": "IF(OR(Q7=\"\", Q7=0, R7=\"\"), \"\", (R7-Q7)/ABS(Q7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "S8": {
        "v": -0.08062747744,
        "f": "IF(OR(R7=\"\", R7=0, S7=\"\"), \"\", (S7-R7)/ABS(R7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "T8": {
        "v": 0.1180625631,
        "f": "IF(OR(S7=\"\", S7=0, T7=\"\"), \"\", (T7-S7)/ABS(S7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "U8": {
        "v": 0.2191499836,
        "f": "IF(OR(T7=\"\", T7=0, U7=\"\"), \"\", (U7-T7)/ABS(T7))",
        "fg": "#1A1B20",
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "V8": {
        "v": 0.1992061447,
        "f": "IFERROR(AVERAGE(L8:U8), 0)",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "B9": {
        "v": "Year",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "C9": {
        "v": 2020,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D9": {
        "v": 2021,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E9": {
        "v": 2022,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F9": {
        "v": 2023,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G9": {
        "v": 2024,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "H9": {
        "v": 2025,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "I9": {
        "v": "5Y Avg",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B10": {
        "v": "Net Income",
        "bg": "#B3CEFB",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "cm": "Темпът на растеж на приходите, който използваме във формулата, е средният темп на растеж на нетния доход/печалби през последните 5 години. \n\nАко TTM EPS е отрицателен, ние не изчисляваме формулата на Питър Линч за тази акция. \n\nАко средният темп на растеж е по-малък от 5%, ние го задаваме на 5%. \n\nАко е по-голямо от 25%, ние го настройваме на 25%"
      },
      "C10": {
        "v": 1599000.0,
        "bg": "#FDD868",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "D10": {
        "v": 1994000.0,
        "bg": "#FDD868",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E10": {
        "v": 2358000.0,
        "bg": "#FDD868",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F10": {
        "v": 3165000.0,
        "bg": "#FDD868",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G10": {
        "v": 2993000.0,
        "bg": "#FDD868",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H10": {
        "v": 3246000.0,
        "bg": "#FDD868",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I10": {
        "v": 2751200.0,
        "f": "AVERAGE(D10:H10)",
        "bg": "#B6D7A8",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K10": {
        "v": "Annual Growth Rate",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "bd": true
      },
      "L10": {
        "bd": true
      },
      "M10": {
        "v": 0.1992061447,
        "f": "IFERROR(V8, 0)",
        "fg": "#1A1B20",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "B11": {
        "v": "YoY Growht",
        "bg": "#B3CEFB",
        "b": true,
        "al": "center",
        "bd": true
      },
      "C11": {
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "D11": {
        "v": 0.2470293934,
        "f": "(D10-C10)/ABS(C10)",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "E11": {
        "v": 0.1825476429,
        "f": "(E10-D10)/ABS(D10)",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "F11": {
        "v": 0.3422391858,
        "f": "(F10-E10)/ABS(E10)",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "G11": {
        "v": -0.05434439179,
        "f": "(G10-F10)/ABS(F10)",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "H11": {
        "v": 0.08453057133,
        "f": "(H10-G10)/ABS(G10)",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "I11": {
        "v": 0.1604004803,
        "f": "AVERAGE(C11:H11)",
        "bg": "#B6D7A8",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "K11": {
        "v": "CAGR",
        "bg": "#D5A6BD",
        "fg": "#1A1B20",
        "b": true,
        "bd": true
      },
      "L11": {
        "bd": true
      },
      "M11": {
        "v": 0.1648733405,
        "f": "CAGR(K7:U7)",
        "bg": "#F9F9FF",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "C13": {
        "v": "Growth Rate",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D13": {
        "v": "EPS TTM",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E13": {
        "v": "PEG",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F13": {
        "v": "Fair Price",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G13": {
        "v": "Stock Price",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "H13": {
        "v": "Difference",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "I13": {
        "v": "#REF!",
        "f": "if(F14>G14,\"BUY\",\"SELL\")",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 17.0,
        "al": "center",
        "bd": true
      },
      "C14": {
        "v": 16.04,
        "bg": "#FDD868",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "cm": "Ако средният темп на растеж е по-малък от 5%, ние го задаваме на 5%. \n\nАко е по-голямо от 25%, ние го настройваме на 25%"
      },
      "D14": {
        "v": 9.65,
        "bg": "#FDD868",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "E14": {
        "v": 1,
        "bg": "#B6D7A8",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F14": {
        "v": 154.786,
        "f": "C14*D14*E14",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "G14": {
        "v": "#REF!",
        "f": "'Stock Valuation'!B7",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "H14": {
        "v": "#REF!",
        "f": "F14/G14-1",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "I14": {
        "bd": true
      }
    }
  },
  {
    "id": "multipleModels",
    "title": "Multiple Models",
    "maxCol": 9,
    "maxRow": 17,
    "colWidths": {
      "1": 112,
      "2": 112,
      "3": 112,
      "4": 95,
      "5": 282,
      "6": 95,
      "7": 95,
      "8": 95
    },
    "merges": [
      {
        "ref": "D3:H3",
        "r1": 3,
        "c1": 4,
        "r2": 3,
        "c2": 8
      }
    ],
    "cells": {
      "D3": {
        "v": "Multiples Model",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E3": {
        "bd": true
      },
      "F3": {
        "bd": true
      },
      "G3": {
        "bd": true
      },
      "H3": {
        "bd": true
      },
      "D4": {
        "v": "Mutliple Model",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center"
      },
      "D5": {
        "v": "Ticker",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E5": {
        "v": "Company",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F5": {
        "v": "Stock Price",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G5": {
        "v": "EPS",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "H5": {
        "v": "P/E Multiple",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D6": {
        "v": "ABT",
        "bg": "#FFD966",
        "al": "center",
        "bd": true
      },
      "E6": {
        "v": "Abbott Laboratories",
        "gf": "googlefinance(D6,\"name\"",
        "bd": true
      },
      "F6": {
        "v": 103.19,
        "gf": "googlefinance(D6,\"price\"",
        "bg": "#A4C2F4",
        "bd": true
      },
      "G6": {
        "v": 2.7,
        "gf": "googlefinance(D6,\"EPS\"",
        "bg": "#A4C2F4",
        "bd": true,
        "fmt": "number2"
      },
      "H6": {
        "v": 38.21851852,
        "f": "F6/G6",
        "bg": "#A4C2F4",
        "bd": true,
        "fmt": "number2"
      },
      "D7": {
        "v": "MDT",
        "bg": "#FFD966",
        "al": "center",
        "bd": true
      },
      "E7": {
        "v": "Medtronic PLC",
        "gf": "googlefinance(D7,\"name\"",
        "bd": true
      },
      "F7": {
        "v": 94.31,
        "gf": "googlefinance(D7,\"price\"",
        "bg": "#A4C2F4",
        "bd": true
      },
      "G7": {
        "v": 4.06,
        "gf": "googlefinance(D7,\"EPS\"",
        "bg": "#A4C2F4",
        "bd": true
      },
      "H7": {
        "v": 23.22906404,
        "f": "F7/G7",
        "bg": "#A4C2F4",
        "bd": true,
        "fmt": "number2"
      },
      "D8": {
        "v": "BSX",
        "bg": "#FFD966",
        "al": "center",
        "bd": true
      },
      "E8": {
        "v": "Boston Scientific Corp",
        "gf": "googlefinance(D8,\"name\"",
        "bd": true
      },
      "F8": {
        "v": 45.01,
        "gf": "googlefinance(D8,\"price\"",
        "bg": "#A4C2F4",
        "bd": true
      },
      "G8": {
        "v": 2.47,
        "gf": "googlefinance(D8,\"EPS\"",
        "bg": "#A4C2F4",
        "bd": true
      },
      "H8": {
        "v": 18.22267206,
        "f": "F8/G8",
        "bg": "#A4C2F4",
        "bd": true,
        "fmt": "number2"
      },
      "D9": {
        "v": "EW",
        "bg": "#FFD966",
        "al": "center",
        "bd": true
      },
      "E9": {
        "v": "Edwards Lifesciences Corp",
        "gf": "googlefinance(D9,\"name\"",
        "bd": true
      },
      "F9": {
        "v": 90.63,
        "gf": "googlefinance(D9,\"price\"",
        "bg": "#A4C2F4",
        "bd": true
      },
      "G9": {
        "v": 1.73,
        "gf": "googlefinance(D9,\"EPS\"",
        "bg": "#A4C2F4",
        "bd": true,
        "fmt": "number2"
      },
      "H9": {
        "v": 52.38728324,
        "f": "F9/G9",
        "bg": "#A4C2F4",
        "bd": true,
        "fmt": "number2"
      },
      "G11": {
        "v": "Average P/E",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "H11": {
        "v": 33.01438446,
        "f": "average(H6:H9)",
        "bg": "#FFD966",
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "G12": {
        "v": "Median P/E",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "H12": {
        "v": 30.72379128,
        "f": "median(H6:H9)",
        "bg": "#FFD966",
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "D14": {
        "v": "Ticker",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E14": {
        "v": "Company:",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F14": {
        "v": "Current Price",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G14": {
        "v": "EPS",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "H14": {
        "v": "Stock Price",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D15": {
        "v": "SYK",
        "bg": "#FFD966",
        "al": "center",
        "bd": true
      },
      "E15": {
        "v": "Stryker Corp",
        "gf": "googlefinance(D15,\"name\"",
        "bd": true
      },
      "F15": {
        "v": 302.33,
        "gf": "googlefinance(D15,\"price\"",
        "bg": "#93C47D",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "G15": {
        "v": 9.65,
        "gf": "googlefinance(D15,\"EPS\"",
        "bg": "#93C47D",
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "H15": {
        "v": 318.5888101,
        "f": "H11*G15",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      }
    }
  },
  {
    "id": "randomMultiple",
    "title": "Random Multiple",
    "maxCol": 24,
    "maxRow": 31,
    "colWidths": {
      "1": 142,
      "2": 107,
      "3": 24,
      "4": 113,
      "5": 95,
      "6": 95,
      "7": 95,
      "8": 95,
      "9": 95,
      "10": 95,
      "11": 95,
      "12": 95,
      "13": 95,
      "14": 113,
      "15": 24,
      "16": 111,
      "17": 111,
      "18": 24,
      "22": 24
    },
    "merges": [
      {
        "ref": "F1:J1",
        "r1": 1,
        "c1": 6,
        "r2": 1,
        "c2": 10
      },
      {
        "ref": "A4:B4",
        "r1": 4,
        "c1": 1,
        "r2": 4,
        "c2": 2
      },
      {
        "ref": "P4:Q4",
        "r1": 4,
        "c1": 16,
        "r2": 4,
        "c2": 17
      },
      {
        "ref": "S4:X4",
        "r1": 4,
        "c1": 19,
        "r2": 4,
        "c2": 24
      },
      {
        "ref": "P8:Q8",
        "r1": 8,
        "c1": 16,
        "r2": 8,
        "c2": 17
      },
      {
        "ref": "A11:B11",
        "r1": 11,
        "c1": 1,
        "r2": 11,
        "c2": 2
      },
      {
        "ref": "P14:Q14",
        "r1": 14,
        "c1": 16,
        "r2": 14,
        "c2": 17
      },
      {
        "ref": "P18:Q18",
        "r1": 18,
        "c1": 16,
        "r2": 18,
        "c2": 17
      },
      {
        "ref": "F30:G31",
        "r1": 30,
        "c1": 6,
        "r2": 31,
        "c2": 7
      },
      {
        "ref": "H30:I31",
        "r1": 30,
        "c1": 8,
        "r2": 31,
        "c2": 9
      },
      {
        "ref": "F9:G9",
        "r1": 9,
        "c1": 6,
        "r2": 9,
        "c2": 7
      },
      {
        "ref": "F16:G16",
        "r1": 16,
        "c1": 6,
        "r2": 16,
        "c2": 7
      },
      {
        "ref": "A18:B18",
        "r1": 18,
        "c1": 1,
        "r2": 18,
        "c2": 2
      },
      {
        "ref": "F23:G23",
        "r1": 23,
        "c1": 6,
        "r2": 23,
        "c2": 7
      },
      {
        "ref": "H25:I25",
        "r1": 25,
        "c1": 8,
        "r2": 25,
        "c2": 9
      },
      {
        "ref": "H26:I28",
        "r1": 26,
        "c1": 8,
        "r2": 28,
        "c2": 9
      },
      {
        "ref": "K26:L28",
        "r1": 26,
        "c1": 11,
        "r2": 28,
        "c2": 12
      }
    ],
    "cells": {
      "A1": {
        "v": "Company ",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B1": {
        "v": "#REF!",
        "f": "Overview!B5",
        "bg": "#93C47D",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "cm": "Тук в този модел не е нужно да въвеждаме името на компанията или нейния тикър символ отново, тъй като те се пренасят автоматично от предния модел (DCF 10 years)."
      },
      "D1": {
        "v": "Market Cap",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E1": {
        "v": 2125683.722,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "integer",
        "cm": "Тук в този модел не е нужно да въвеждаме цената отново, тъй като тя се пренася автоматично от предния модел (DCF 10 years)."
      },
      "F1": {
        "v": "* Въвеждайте стойности само в жълтите полета",
        "fg": "#F1C232",
        "b": true,
        "al": "center"
      },
      "K1": {
        "v": "Data",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "L1": {
        "v": "#REF!",
        "f": "Overview!G6",
        "bg": "#93C47D",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "date"
      },
      "A2": {
        "v": "Revenue",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B2": {
        "v": 1159897.0,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0",
        "cm": "Тук въвеждаме Free Cash Flow per share. \nВзимаме тези данни от уебсайта stockanalysis.com или друг подобен уебсайт или просто ги изчисляваме по следната формула:\n\nFCF per share = Free Cash Flow / Shares Outstanding"
      },
      "A4": {
        "v": "Optimistic Scenario",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B4": {
        "bd": true
      },
      "D4": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E4": {
        "v": 2027,
        "f": "D4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F4": {
        "v": 2028,
        "f": "E4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G4": {
        "v": 2029,
        "f": "F4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "H4": {
        "v": 2030,
        "f": "G4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "I4": {
        "v": 2031,
        "f": "H4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "J4": {
        "v": 2032,
        "f": "I4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "K4": {
        "v": 2033,
        "f": "J4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "L4": {
        "v": 2034,
        "f": "K4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "M4": {
        "v": 2035,
        "f": "L4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "N4": {
        "v": 2036,
        "f": "M4+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "P4": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q4": {
        "bd": true
      },
      "S4": {
        "v": "10 Years EV/EBITDA",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "T4": {
        "bd": true
      },
      "U4": {
        "bd": true
      },
      "V4": {
        "bd": true
      },
      "W4": {
        "bd": true
      },
      "X4": {
        "bd": true
      },
      "A5": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B5": {
        "v": 0.1,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме процентът, с който дисконтираме бъдещите парични потоци и така ги приравняваме до днешната им стойност.\n\nМоже вие да изберете сами за себе си какъв процент да сложите, като това трябва да е съобразено горе долу с това каква доходност ще очаквате минимум за следващите 10 години от тази компания.\n\nПо принцип, някои анализатори слагат лихвата по 10 годишните държавни облигации.\n\nДруги пък, отпускат малко премия над тях, както го прави Уорън Бъфет, за да компенсират за риска, който поемат, ако изберат да инвестират.\n\nМожем също да въведем WACC, ако пожелаем. \n\nОбикновено този процент е по-висок за по-рисковите компании и по-нисък за по-стабилните такива.\n\n10% е стандартът, който за мен е нормален да използваме като Discount rate, като този процент може да се увеличи, ако смятаме някоя по-рискова компания на 11 или 12% и може да се понижи, ако пресмятаме някоя супер утвърдена такава, например някоя, която изплаща дивиденти от 50 години. Тогава Discount rate може да смъкнем на 8%, но в никакъв случай аз не взимам процент по-нисък от 8%.\n\nИ естествено, можем да използваме различни Discount rates и за трите сценария."
      },
      "D5": {
        "v": 1159897.0,
        "f": "B2",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "E5": {
        "v": 1241089.79,
        "f": "D5*(1+$B$6)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F5": {
        "v": 1327966.075,
        "f": "E5*(1+$B$6)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G5": {
        "v": 1420923.701,
        "f": "F5*(1+$B$6)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H5": {
        "v": 1520388.36,
        "f": "G5*(1+$B$6)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I5": {
        "v": 1626815.545,
        "f": "H5*(1+$B$6)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "J5": {
        "v": 1740692.633,
        "f": "I5*(1+$B$7)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "K5": {
        "v": 1862541.117,
        "f": "J5*(1+$B$7)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L5": {
        "v": 1992918.995,
        "f": "K5*(1+$B$7)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "M5": {
        "v": 2132423.325,
        "f": "L5*(1+$B$7)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N5": {
        "v": 2281692.958,
        "f": "M5*(1+$B$7)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "P5": {
        "v": "Amount Invested",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q5": {
        "v": 24040.0,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "S5": {
        "v": "Year 10",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "T5": {
        "v": 2024,
        "al": "center",
        "bd": true
      },
      "U5": {
        "v": 26113.0,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "V5": {
        "bd": true,
        "fmt": "percent"
      },
      "W5": {
        "v": "Y9 to Y10",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "X5": {
        "v": 0.06232455962,
        "f": "(U5-U6)/ABS(U6)",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A6": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B6": {
        "v": 0.07,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме с колко според нас ще увеличава компанията своите free cash flow per share за следващите 5 години.\n\nМожем да вземем предвид миналите резултати, като например тези за последните 5 или 10 години."
      },
      "D6": {
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N6": {
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "P6": {
        "v": "Amount Returned",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q6": {
        "v": 26581.0,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "S6": {
        "v": "Year 9",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "T6": {
        "v": 2023,
        "al": "center",
        "bd": true
      },
      "U6": {
        "v": 24581.0,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "V6": {
        "bd": true,
        "fmt": "percent"
      },
      "W6": {
        "v": "Y8 to Y9",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "X6": {
        "v": -0.09278464661,
        "f": "(U6-U7)/ABS(U7)",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A7": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B7": {
        "v": 0.07,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме с колко според нас ще увеличава компанията своите free cash flow per share за периода от 5-тата до 10-тата година.\n\nМожем да вземем предвид миналите резултати, като например тези за последните 5 или 10 години."
      },
      "D7": {
        "v": 12315679.72,
        "f": "E7/(1+$B$5)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "E7": {
        "v": 13547247.69,
        "f": "F7/(1+$B$5)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "F7": {
        "v": 14901972.46,
        "f": "G7/(1+$B$5)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "G7": {
        "v": 16392169.7,
        "f": "H7/(1+$B$5)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "H7": {
        "v": 18031386.68,
        "f": "I7/(1+$B$5)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I7": {
        "v": 19834525.34,
        "f": "J7/(1+$B$5)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "J7": {
        "v": 21817977.88,
        "f": "K7/(1+$B$5)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "K7": {
        "v": 23999775.67,
        "f": "L7/(1+$B$5)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "L7": {
        "v": 26399753.23,
        "f": "M7/(1+$B$5)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "M7": {
        "v": 29039728.55,
        "f": "N7/(1+$B$5)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "N7": {
        "v": 31943701.41,
        "f": "N5*$B$8",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "P7": {
        "v": "Years",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q7": {
        "v": 5,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "S7": {
        "v": "Year 8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "T7": {
        "v": 2022,
        "al": "center",
        "bd": true
      },
      "U7": {
        "v": 27095.0,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "V7": {
        "bd": true,
        "fmt": "percent"
      },
      "W7": {
        "v": "Y7 to Y8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "X7": {
        "v": 0.01085658857,
        "f": "(U7-U8)/ABS(U8)",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A8": {
        "v": "Price to FCF",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B8": {
        "v": 14,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "cm": "Тук въвеждаме Price to  Free Cash Flow стойността, която имаме за компанията.\n\nМожем да вземем данните за тази стойност от financecharts.com, като отворим съответната компания, след това отидем на Charts и изберем Price/FCF ratio.\n\nЗа оптимистичния вариант можем да вземем малко по-висока стойност от средната."
      },
      "D8": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "N8": {
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "P8": {
        "fg": "#000000",
        "bd": true
      },
      "Q8": {
        "bd": true
      },
      "S8": {
        "v": "Year 7",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "T8": {
        "v": 2021,
        "al": "center",
        "bd": true
      },
      "U8": {
        "v": 26804.0,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "V8": {
        "bd": true,
        "fmt": "percent"
      },
      "W8": {
        "v": "Y6 to Y7",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "X8": {
        "v": 0.1149750416,
        "f": "(U8-U9)/ABS(U9)",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A9": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B9": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме маржът ни на безопасност. Тази стойност, обикновено 10%, ни дава възможност да бъдем още една идея по-консервативни и да приемем, че със сигурност сме допуснали грешки при прогнозирането на движението на свободните парични потоци за следващите 10 години.\n\nMargin of Safety е задължителен процент за всеки един инвеститор в стойност, тъй като никой не може да прогнозира бъдещето със сигурност и затова е редно да вземем допълнителни мерки, за да се подсигурим още повече, че може би смятаме правилно.\n\nКогато въвеждаме Margin of Safety, ние \"събаряме\" умишлено още справедливата цена. И ако след прилагането на този процент сметките излизат, т.е. компанията е подценена, можем да бъдем още по-сигурни в нашия избор."
      },
      "D9": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E9": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F9": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G9": {
        "bd": true
      },
      "H9": {
        "v": 11084111.75,
        "f": "D7*(1-B9)",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I9": {
        "bd": true
      },
      "J9": {
        "bd": true
      },
      "K9": {
        "bd": true
      },
      "L9": {
        "bd": true
      },
      "M9": {
        "bd": true
      },
      "N9": {
        "bd": true
      },
      "P9": {
        "v": "ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q9": {
        "v": 0.1056988353,
        "f": "(Q6 - Q5) / Q5",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "S9": {
        "v": "Year 6",
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "T9": {
        "v": 2020,
        "bg": "#FFD966",
        "al": "center",
        "bd": true
      },
      "U9": {
        "v": 24040.0,
        "bg": "#FFD966",
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "V9": {
        "bg": "#FFD966",
        "bd": true,
        "fmt": "percent"
      },
      "W9": {
        "v": "Y5 to Y6",
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "X9": {
        "v": -0.03886134655,
        "f": "(U9-U10)/ABS(U10)",
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "P10": {
        "v": "Annualized ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q10": {
        "v": 0.02029878721,
        "f": "((1+(Q6-Q5)/Q5)^(1/Q7)-1)",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "S10": {
        "v": "Year 5",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "T10": {
        "v": 2019,
        "al": "center",
        "bd": true
      },
      "U10": {
        "v": 25012.0,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "V10": {
        "bd": true,
        "fmt": "percent"
      },
      "W10": {
        "v": "Y4 to Y5",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "X10": {
        "v": -0.05771549126,
        "f": "(U10-U11)/ABS(U11)",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A11": {
        "v": "Average Scenario",
        "bg": "#6FA8DC",
        "fg": "#000000",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B11": {
        "bd": true
      },
      "D11": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E11": {
        "v": 2027,
        "f": "D11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F11": {
        "v": 2028,
        "f": "E11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G11": {
        "v": 2029,
        "f": "F11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "H11": {
        "v": 2030,
        "f": "G11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "I11": {
        "v": 2031,
        "f": "H11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "J11": {
        "v": 2032,
        "f": "I11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "K11": {
        "v": 2033,
        "f": "J11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "L11": {
        "v": 2034,
        "f": "K11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "M11": {
        "v": 2035,
        "f": "L11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "N11": {
        "v": 2036,
        "f": "M11+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "P11": {
        "v": "Gain",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q11": {
        "v": 2541.0,
        "f": "Q6-Q5",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "S11": {
        "v": "Year 4",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "T11": {
        "v": 2018,
        "al": "center",
        "bd": true
      },
      "U11": {
        "v": 26544.0,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "V11": {
        "bd": true,
        "fmt": "percent"
      },
      "W11": {
        "v": "Y3 to Y4",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "X11": {
        "v": 0.07753511407,
        "f": "(U11-U12)/ABS(U12)",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A12": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B12": {
        "v": 0.1,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме процентът, с който дисконтираме бъдещите парични потоци и така ги приравняваме до днешната им стойност.\n\nМоже вие да изберете сами за себе си какъв процент да сложите, като това трябва да е съобразено горе долу с това каква доходност ще очаквате минимум за следващите 10 години от тази компания.\n\nПо принцип, някои анализатори слагат лихвата по 10 годишните държавни облигации.\n\nДруги пък, отпускат малко премия над тях, както го прави Уорън Бъфет, за да компенсират за риска, който поемат, ако изберат да инвестират.\n\nМожем също да въведем WACC, ако пожелаем. \n\nОбикновено този процент е по-висок за по-рисковите компании и по-нисък за по-стабилните такива.\n\n10% е стандартът, който за мен е нормален да използваме като Discount rate, като този процент може да се увеличи, ако смятаме някоя по-рискова компания на 11 или 12% и може да се понижи, ако пресмятаме някоя супер утвърдена такава, например някоя, която изплаща дивиденти от 50 години. Тогава Discount rate може да смъкнем на 8%, но в никакъв случай аз не взимам процент по-нисък от 8%.\n\nИ естествено, можем да използваме различни Discount rates и за трите сценария."
      },
      "D12": {
        "v": 1159897.0,
        "f": "B2",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E12": {
        "v": 1217891.85,
        "f": "D12*(1+$B$13)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F12": {
        "v": 1278786.443,
        "f": "E12*(1+$B$13)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G12": {
        "v": 1342725.765,
        "f": "F12*(1+$B$13)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H12": {
        "v": 1409862.053,
        "f": "G12*(1+$B$13)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I12": {
        "v": 1480355.155,
        "f": "H12*(1+$B$14)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J12": {
        "v": 1554372.913,
        "f": "I12*(1+$B$14)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K12": {
        "v": 1632091.559,
        "f": "J12*(1+$B$14)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L12": {
        "v": 1713696.137,
        "f": "K12*(1+$B$14)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M12": {
        "v": 1799380.944,
        "f": "L12*(1+$B$14)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N12": {
        "v": 1889349.991,
        "f": "M12*(1+$B$14)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "S12": {
        "v": "Year 3",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "T12": {
        "v": 2017,
        "al": "center",
        "bd": true
      },
      "U12": {
        "v": 24634.0,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "V12": {
        "bd": true,
        "fmt": "percent"
      },
      "W12": {
        "v": "Y2 to Y3",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "X12": {
        "v": -0.0006896271957,
        "f": "(U12-U13)/ABS(U13)",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A13": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B13": {
        "v": 0.05,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме с колко според нас ще увеличава компанията своите free cash flow per share за следващите 5 години.\n\nМожем да вземем предвид миналите резултати, като например тези за последните 5 или 10 години."
      },
      "D13": {
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N13": {
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "S13": {
        "v": "Year 2",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "T13": {
        "v": 2016,
        "al": "center",
        "bd": true
      },
      "U13": {
        "v": 24651.0,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "V13": {
        "bd": true,
        "fmt": "percent"
      },
      "W13": {
        "v": "Y1 to Y2",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "X13": {
        "v": 0.04356108712,
        "f": "(U13-U14)/ABS(U14)",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A14": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B14": {
        "v": 0.05,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме с колко според нас ще увеличава компанията своите free cash flow per share за периода от 5-тата до 10-тата година.\n\nМожем да вземем предвид миналите резултати, като например тези за последните 5 или 10 години."
      },
      "D14": {
        "v": 5098983.473,
        "f": "E14/(1+$B$12)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E14": {
        "v": 5608881.82,
        "f": "F14/(1+$B$12)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F14": {
        "v": 6169770.002,
        "f": "G14/(1+$B$12)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G14": {
        "v": 6786747.002,
        "f": "H14/(1+$B$12)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H14": {
        "v": 7465421.702,
        "f": "I14/(1+$B$12)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I14": {
        "v": 8211963.873,
        "f": "J14/(1+$B$12)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J14": {
        "v": 9033160.26,
        "f": "K14/(1+$B$12)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K14": {
        "v": 9936476.286,
        "f": "L14/(1+$B$12)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L14": {
        "v": 10930123.91,
        "f": "M14/(1+$B$12)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M14": {
        "v": 12023136.31,
        "f": "N14/(1+$B$12)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N14": {
        "v": 13225449.94,
        "f": "N12*$B$15",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "P14": {
        "v": "ROI Calculator",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q14": {
        "bd": true
      },
      "S14": {
        "v": "Year 1",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "T14": {
        "v": 2015,
        "al": "center",
        "bd": true
      },
      "U14": {
        "v": 23622.0,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "V14": {
        "bd": true,
        "fmt": "percent"
      },
      "W14": {
        "v": "Y0 to Y1",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "X14": {
        "v": -0.05730704765,
        "f": "(U14-U15)/ABS(U15)",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A15": {
        "v": "Price to FCF",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B15": {
        "v": 7,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "cm": "Тук въвеждаме Price to  Free Cash Flow стойността, която имаме за компанията.\n\nМожем да вземем данните за тази стойност от financecharts.com, като отворим съответната компания, след това отидем на Charts и изберем Price/FCF ratio.\n\nЗа средния (базов вариант) можем да вземем средната стойност за последните 10 години."
      },
      "D15": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "N15": {
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "P15": {
        "v": "Amount Invested",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "Q15": {
        "v": 25058.0,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "S15": {
        "v": "Year 0",
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "T15": {
        "v": 2014,
        "bg": "#FFD966",
        "al": "center",
        "bd": true
      },
      "U15": {
        "v": 25058.0,
        "bg": "#FFD966",
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "V15": {
        "bg": "#FFD966",
        "bd": true,
        "fmt": "number2"
      },
      "W15": {
        "bg": "#FFD966",
        "bd": true,
        "fmt": "percent"
      },
      "X15": {
        "bg": "#FFD966",
        "bd": true,
        "fmt": "percent"
      },
      "A16": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B16": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме маржът ни на безопасност. Тази стойност, обикновено 10%, ни дава възможност да бъдем още една идея по-консервативни и да приемем, че със сигурност сме допуснали грешки при прогнозирането на движението на свободните парични потоци за следващите 10 години.\n\nMargin of Safety е задължителен процент за всеки един инвеститор в стойност, тъй като никой не може да прогнозира бъдещето със сигурност и затова е редно да вземем допълнителни мерки, за да се подсигурим още повече, че може би смятаме правилно.\n\nКогато въвеждаме Margin of Safety, ние \"събаряме\" умишлено още справедливата цена. И ако след прилагането на този процент сметките излизат, т.е. компанията е подценена, можем да бъдем още по-сигурни в нашия избор."
      },
      "D16": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E16": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F16": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G16": {
        "bd": true
      },
      "H16": {
        "v": 4589085.125,
        "f": "D14*(1-B16)",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I16": {
        "bd": true
      },
      "J16": {
        "bd": true
      },
      "K16": {
        "bd": true
      },
      "L16": {
        "bd": true
      },
      "M16": {
        "bd": true
      },
      "N16": {
        "bd": true
      },
      "P16": {
        "v": "Amount Returned",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "Q16": {
        "v": 26113.0,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "S16": {
        "bd": true,
        "fmt": "percent"
      },
      "T16": {
        "v": 2013,
        "al": "center",
        "bd": true
      },
      "U16": {
        "v": 20131.0,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "V16": {
        "bd": true,
        "fmt": "number2"
      },
      "W16": {
        "bd": true,
        "fmt": "percent"
      },
      "X16": {
        "bd": true,
        "fmt": "percent"
      },
      "P17": {
        "v": "Years",
        "fg": "#000000",
        "al": "center",
        "bd": true
      },
      "Q17": {
        "v": 10,
        "bg": "#F1C232",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true
      },
      "S17": {
        "bd": true,
        "fmt": "percent"
      },
      "T17": {
        "v": "Average",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "U17": {
        "v": 25286.72727,
        "f": "AVERAGE(U5:U15)",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "number2"
      },
      "V17": {
        "bd": true,
        "fmt": "number2"
      },
      "W17": {
        "v": "Average",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "X17": {
        "v": 0.006189423171,
        "f": "AVERAGE(X5:X14)",
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "A18": {
        "v": "Worst Scenario",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "B18": {
        "bd": true
      },
      "D18": {
        "v": 2026,
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E18": {
        "v": 2027,
        "f": "D18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F18": {
        "v": 2028,
        "f": "E18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G18": {
        "v": 2029,
        "f": "F18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "H18": {
        "v": 2030,
        "f": "G18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "I18": {
        "v": 2031,
        "f": "H18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "J18": {
        "v": 2032,
        "f": "I18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "K18": {
        "v": 2033,
        "f": "J18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "L18": {
        "v": 2034,
        "f": "K18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "M18": {
        "v": 2035,
        "f": "L18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "N18": {
        "v": 2036,
        "f": "M18+1",
        "bg": "#002060",
        "fg": "#F3F3F3",
        "b": true,
        "al": "center",
        "bd": true
      },
      "P18": {
        "fg": "#000000",
        "bd": true
      },
      "Q18": {
        "bd": true
      },
      "A19": {
        "v": "Discount Rate",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true,
        "fmt": "currency2"
      },
      "B19": {
        "v": 0.1,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме процентът, с който дисконтираме бъдещите парични потоци и така ги приравняваме до днешната им стойност.\n\nМоже вие да изберете сами за себе си какъв процент да сложите, като това трябва да е съобразено горе долу с това каква доходност ще очаквате минимум за следващите 10 години от тази компания.\n\nПо принцип, някои анализатори слагат лихвата по 10 годишните държавни облигации.\n\nДруги пък, отпускат малко премия над тях, както го прави Уорън Бъфет, за да компенсират за риска, който поемат, ако изберат да инвестират.\n\nМожем също да въведем WACC, ако пожелаем. \n\nОбикновено този процент е по-висок за по-рисковите компании и по-нисък за по-стабилните такива.\n\n10% е стандартът, който за мен е нормален да използваме като Discount rate, като този процент може да се увеличи, ако смятаме някоя по-рискова компания на 11 или 12% и може да се понижи, ако пресмятаме някоя супер утвърдена такава, например някоя, която изплаща дивиденти от 50 години. Тогава Discount rate може да смъкнем на 8%, но в никакъв случай аз не взимам процент по-нисък от 8%.\n\nИ естествено, можем да използваме различни Discount rates и за трите сценария."
      },
      "D19": {
        "v": 1159897.0,
        "f": "B2",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E19": {
        "v": 1194693.91,
        "f": "D19*(1+$B$20)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F19": {
        "v": 1230534.727,
        "f": "E19*(1+$B$20)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G19": {
        "v": 1267450.769,
        "f": "F19*(1+$B$20)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H19": {
        "v": 1305474.292,
        "f": "G19*(1+$B$20)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I19": {
        "v": 1344638.521,
        "f": "H19*(1+$B$20)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J19": {
        "v": 1384977.677,
        "f": "I19*(1+$B$21)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K19": {
        "v": 1426527.007,
        "f": "J19*(1+$B$21)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L19": {
        "v": 1469322.817,
        "f": "K19*(1+$B$21)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M19": {
        "v": 1513402.502,
        "f": "L19*(1+$B$21)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N19": {
        "v": 1558804.577,
        "f": "M19*(1+$B$21)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "P19": {
        "v": "ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q19": {
        "v": 0.04210232261,
        "f": "(Q16 - Q15) / Q15",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A20": {
        "v": "Growth next 5 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B20": {
        "v": 0.03,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме с колко според нас ще увеличава компанията своите free cash flow per share за следващите 5 години.\n\nМожем да вземем предвид миналите резултати, като например тези за последните 5 или 10 години."
      },
      "D20": {
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N20": {
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "P20": {
        "v": "Annualized ROI",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q20": {
        "v": 0.004132529126,
        "f": "((1+(Q16-Q15)/Q15)^(1/Q17)-1)",
        "fg": "#FF0000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "percent"
      },
      "A21": {
        "v": "Growth 5-10 years",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "left",
        "bd": true
      },
      "B21": {
        "v": 0.03,
        "bg": "#FFD966",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме с колко според нас ще увеличава компанията своите free cash flow per share за периода от 5-тата до 10-тата година.\n\nМожем да вземем предвид миналите резултати, като например тези за последните 5 или 10 години."
      },
      "D21": {
        "v": 3004933.22,
        "f": "E21/(1+$B$19)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "E21": {
        "v": 3305426.542,
        "f": "F21/(1+$B$19)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "F21": {
        "v": 3635969.197,
        "f": "G21/(1+$B$19)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G21": {
        "v": 3999566.116,
        "f": "H21/(1+$B$19)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H21": {
        "v": 4399522.728,
        "f": "I21/(1+$B$19)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I21": {
        "v": 4839475.001,
        "f": "J21/(1+$B$19)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "J21": {
        "v": 5323422.501,
        "f": "K21/(1+$B$19)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "K21": {
        "v": 5855764.751,
        "f": "L21/(1+$B$19)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "L21": {
        "v": 6441341.226,
        "f": "M21/(1+$B$19)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "M21": {
        "v": 7085475.348,
        "f": "N21/(1+$B$19)",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "N21": {
        "v": 7794022.883,
        "f": "N19*$B$22",
        "bg": "#C9DAF8",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "P21": {
        "v": "Gain",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "Q21": {
        "v": 1055.0,
        "f": "Q16-Q15",
        "bg": "#A4C2F4",
        "fg": "#000000",
        "b": true,
        "al": "right",
        "bd": true,
        "fmt": "currency2"
      },
      "A22": {
        "v": "Price to FCF",
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B22": {
        "v": 5,
        "bg": "#1155CC",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "cm": "Тук въвеждаме Price to  Free Cash Flow стойността, която имаме за компанията.\n\nМожем да вземем данните за тази стойност от financecharts.com, като отворим съответната компания, след това отидем на Charts и изберем Price/FCF ratio.\n\nЗа най-лошия вариант можем да вземем малко по-ниска стойност от средната."
      },
      "D22": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "N22": {
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "A23": {
        "v": "Margin of Safety",
        "bg": "#C9DAF8",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "B23": {
        "v": 0.1,
        "fg": "#FF0000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме маржът ни на безопасност. Тази стойност, обикновено 10%, ни дава възможност да бъдем още една идея по-консервативни и да приемем, че със сигурност сме допуснали грешки при прогнозирането на движението на свободните парични потоци за следващите 10 години.\n\nMargin of Safety е задължителен процент за всеки един инвеститор в стойност, тъй като никой не може да прогнозира бъдещето със сигурност и затова е редно да вземем допълнителни мерки, за да се подсигурим още повече, че може би смятаме правилно.\n\nКогато въвеждаме Margin of Safety, ние \"събаряме\" умишлено още справедливата цена. И ако след прилагането на този процент сметките излизат, т.е. компанията е подценена, можем да бъдем още по-сигурни в нашия избор."
      },
      "D23": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E23": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "F23": {
        "v": "INTRINSIC VALUE",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "G23": {
        "bd": true
      },
      "H23": {
        "v": 2704439.898,
        "f": "D21*(1-B23)",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "I23": {
        "bd": true
      },
      "J23": {
        "bd": true
      },
      "K23": {
        "bd": true
      },
      "L23": {
        "bd": true
      },
      "M23": {
        "bd": true
      },
      "N23": {
        "bd": true
      },
      "D25": {
        "v": "Scenarious",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "E25": {
        "v": "Weight",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "F25": {
        "v": "Intrinsic Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "G25": {
        "v": "IV x Weight",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "H25": {
        "v": "Average Intrinsic Value",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "i": true,
        "al": "center",
        "bd": true
      },
      "I25": {
        "bd": true
      },
      "J25": {
        "fg": "#FFFFFF",
        "bd": true
      },
      "K25": {
        "bd": true
      },
      "L25": {
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "D26": {
        "v": "Optimistic",
        "bg": "#00FF00",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E26": {
        "v": 0.1,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме какво тегло искаме да придадем на оптимистичния вариант. Общо теглата от 3-те сценария трябва да бъдат точно 100%"
      },
      "F26": {
        "v": 11084111.75,
        "f": "H9",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G26": {
        "v": 1108411.175,
        "f": "F26*E26",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H26": {
        "v": 4673194.219,
        "f": "sum(G26:G28)",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "currency2"
      },
      "I26": {
        "bd": true
      },
      "K26": {
        "v": "BUY",
        "f": "if(H26>E1,\"BUY\",\"SELL\")",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 18.0,
        "al": "center",
        "bd": true
      },
      "L26": {
        "bd": true
      },
      "D27": {
        "v": "Average",
        "bg": "#6FA8DC",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E27": {
        "v": 0.6,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме какво тегло искаме да придадем на базовия вариант. Общо теглата от 3-те сценария трябва да бъдат точно 100%"
      },
      "F27": {
        "v": 4589085.125,
        "f": "H16",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G27": {
        "v": 2753451.075,
        "f": "F27*E27",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H27": {
        "bd": true
      },
      "I27": {
        "bd": true
      },
      "K27": {
        "bd": true
      },
      "L27": {
        "bd": true
      },
      "D28": {
        "v": "Worst",
        "bg": "#FF0000",
        "fg": "#FFFFFF",
        "b": true,
        "al": "center",
        "bd": true
      },
      "E28": {
        "v": 0.3,
        "bg": "#FFD966",
        "fg": "#000000",
        "b": true,
        "al": "center",
        "bd": true,
        "fmt": "percent",
        "cm": "Тук въвеждаме какво тегло искаме да придадем на най-лошия вариант. Общо теглата от 3-те сценария трябва да бъдат точно 100%"
      },
      "F28": {
        "v": 2704439.898,
        "f": "H23",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "G28": {
        "v": 811331.9695,
        "f": "F28*E28",
        "fg": "#000000",
        "al": "center",
        "bd": true,
        "fmt": "currency0"
      },
      "H28": {
        "bd": true
      },
      "I28": {
        "bd": true
      },
      "K28": {
        "bd": true
      },
      "L28": {
        "bd": true
      },
      "D29": {
        "bd": true
      },
      "E29": {
        "v": 1.0,
        "f": "sum(E26:E28)",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "L29": {
        "bd": true
      },
      "D30": {
        "bd": true
      },
      "F30": {
        "v": "Under / Over Valued",
        "bg": "#002060",
        "fg": "#FFFFFF",
        "b": true,
        "sz": 12.0,
        "al": "center",
        "bd": true
      },
      "G30": {
        "bd": true
      },
      "H30": {
        "v": 1.198442869,
        "f": "H26/E1-1",
        "bg": "#000000",
        "fg": "#FFFFFF",
        "sz": 18.0,
        "al": "center",
        "bd": true,
        "fmt": "percent"
      },
      "I30": {
        "bd": true
      },
      "L30": {
        "bd": true
      },
      "D31": {
        "bd": true
      },
      "E31": {
        "bd": true
      },
      "F31": {
        "bd": true
      },
      "G31": {
        "bd": true
      },
      "H31": {
        "bd": true
      },
      "I31": {
        "bd": true
      },
      "J31": {
        "fg": "#FFFFFF",
        "al": "center",
        "bd": true
      },
      "K31": {
        "bd": true
      },
      "L31": {
        "bd": true
      }
    }
  }
];
