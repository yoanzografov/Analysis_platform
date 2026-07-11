import { Stock, MarketIndex } from '../types';

// Raw CSV data containing all original rows and configuration exactly from the user upload
export const RAW_SPREADSHEET_CSV = `Platform 2026,,,,,,,,,,,,,,,,,,
,"Monitor stocks you’re interested in. Add tickers, target prices, and key metrics.",,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,
,,,SIGNAL,,,S&P 500,,,Dow Jones,,,Nasdaq,,,,,,,
,,,BUY,26,,▲ +1.08%,7500.58,,▲ +0.14%,51564.7,,▲ +2.48%,26517.93,,,,,,
,,,SELL,27,,,,,,,,,,,,,,,
,,,HOLD,144,,,,,,,,,,,,,,,
,,,,,,DAX,,,Nikkei 225,,,FTSE 100,,,,,,,
,,,BUY / SELL ,,,▲ +0.55%,25164.66,,▲ +0.28%,71250.06,,▲ +0.10%,10410.12,,,,,,
,,,BUY,51,,,,,,,,,,,,,,,
,,,SELL,146,,,,,,,,,,,,,,,
,,,,,,Best Performer,,,Worst Performer,,,,,,,,,,
,,,,,,STO:EVO,223.00$,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,
Watch,Ticker,Company Name,365 Chart,Date,Price of Calc.,Daily Change %,Current Price,Fair Price,Difference,BUY/SELL,Market Cap,P/E Ratio,EPS,Profil,Dividend,Signal,52 Low,52 High,AI Analis
,AAPL,Apple Inc,,23.01.2025 г.,223.00$,▲ +0.70%,298.01$,108.00$,-63.76%,SELL,4376977317,36.05,8.27$,Линк,,Hold,196.86$,317.40$,
,ABBV,AbbVie Common Stock,,08.05.2025 г.,185.00$,▼ -2.14%,216.49$,152.00$,-29.79%,SELL,382492810,106.84,2.03$,Линк,,Hold,181.73$,244.81$,
Atten,ABNB,Airbnb Inc,,10.07.2025 г.,137.00$,▲ +1.33%,142.41$,99.00$,-30.48%,SELL,84521035,35.09,4.06$,Линк,,Sell,110.81$,147.25$,
,ABT,Abbott Laboratories,,08.05.2025 г.,135.00$,▼ -0.10%,88.41$,58.00$,-34.40%,SELL,153993605,24.62,3.59$,Линк,,Hold,81.97$,139.06$,
,ACIW,ACI Worldwide Inc,,07.10.2025 г.,53.00$,▼ -1.23%,44.09$,36.00$,-18.35%,SELL,4482256,22.17,1.99$,Линк,,Hold,38.05$,54.28$,
,ACN,Accenture Plc,,12.05.2026 г.,,▼ -17.97%,127.98$,220.00$,71.90%,BUY,78571941,10.49,12.20$,Линк,,Buy,125.60$,307.77$,
,ADBE,Adobe Inc,,16.12.2025 г.,347.00$,▼ -0.57%,195.16$,300.00$,53.72%,BUY,77576101,11.17,17.47$,Линк,,Buy,190.12$,392.54$,
,ADI ,Analog Devices Inc,,,190.00$,▲ +4.83%,434.46$,130.00$,-70.08%,SELL,211619770,64.56,6.73$,Линк,,Sell,218.38$,439.51$,
,ADM,Archer-Daniels-Midland Co,,23.01.2025 г.,50.75$,▼ -1.83%,75.10$,69.00$,-8.12%,SELL,36194940,33.62,2.23$,Линк,,Hold,51.34$,85.37$,
Sell,ADP,Automatic Data Processing Inc,,23.04.2024 г.,297.64$,▼ -0.16%,218.41$,152.00$,-30.41%,SELL,87305970,20.36,10.73$,Линк,,Hold,188.16$,315.92$,
Atten,ALB,Albemarle Corp,,04.04.2023 г.,181.00$,▼ -3.73%,160.35$,144.00$,-10.20%,SELL,18910814,-,-3.41$,Линк,,Hold,55.90$,221.00$,
Sell,AMAT,Applied Materials Inc,,09.04.2024 г.,169.64$,▲ +4.08%,617.11$,216.00$,-65.00%,SELL,489960212,58.00,10.64$,Линк,,Sell,154.47$,638.90$,
,AMD,Advanced Micro Devices Inc,,26.11.2024 г.,137.00$,▲ +4.86%,537.37$,74.00$,-86.23%,SELL,876235514,176.33,3.05$,Линк,,Sell,126.82$,558.37$,
,AMGN,Amgen Inc,,11.02.2025 г.,294.00$,▼ -1.19%,337.60$,197.00$,-41.65%,SELL,182205458,23.47,14.38$,Линк,,Hold,267.83$,391.29$,
Atten,AMPH,"Amphastar Pharmaceuticals, Inc",,22.10.2024 г.,50.00$,▼ -3.09%,18.81$,56.00$,197.71%,BUY,829388,11.28,1.67$,Линк,,Hold,16.65$,31.26$,
,AMZN,Amazon.com Inc,,04.11.2025 г.,249.00$,▲ +2.90%,244.39$,180.00$,-26.35%,SELL,2628930106,29.21,8.37$,Линк,,Hold,196.00$,278.56$,
,ANET,Arista Networks Inc,,11.03.2025 г.,80.00$,▲ +2.87%,169.67$,59.00$,-65.23%,SELL,213648801,58.11,2.92$,Линк,,Hold,85.58$,179.80$,
,APH,Amphenol Corp,,24.10.2025 г.,137.00$,▲ +1.77%,163.96$,65.00$,-60.36%,SELL,201709175,47.11,3.48$,Линк, 1.00 (0.61%) ,Sell,92.98$,167.04$,
,ASML,ASML Holding NV,,29.07.2025 г.,721.00$,▲ +3.31%,"1,929.68$",662.00$,-65.69%,SELL,641838615,64.89,29.74$,Линк,,Sell,683.48$,"1,942.87$",
,AVGO,Broadcom Inc,,09.09.2025 г.,339.00$,▲ +4.70%,411.35$,137.00$,-66.70%,SELL,1957030151,68.48,6.01$,Линк,,Hold,244.18$,495.00$,
,AWK,American Water Works Co Inc,,23.04.2024 г.,134.23$,▼ -0.27%,125.07$,95.00$,-24.04%,SELL,24423732,22.13,5.65$,Линк,,Buy,120.57$,147.87$,
Atten,AZN,AstraZeneca PLC (US),,20.11.2025 г.,90.00$,▼ -1.66%,174.93$,,-100.00%,SELL,209044913,26.29,6.65$,Линк, 3.35 (1.91%) ,Hold,68.61$,212.71$,
,BBY,Best Buy Co Inc,,03.12.2024 г.,89.00$,▲ +3.59%,74.73$,70.00$,-6.33%,SELL,15750626,13.79,5.42$,Линк,,Hold,55.10$,84.99$,
,BKNG,Booking Holdings Inc,,12.08.2025 г.,"5,464.00$",▲ +0.09%,171.78$,"3,520.00$",1949.13%,BUY,133108628,22.58,7.61$,Линк,,Hold,150.14$,233.58$,
,BMY,Bristol-Myers Squibb Co,,02.07.2024 г.,40.00$,▼ -2.32%,54.00$,69.00$,27.78%,BUY,110271834,15.16,3.56$,Линк,,Hold,42.52$,62.89$,
Atten,BRBY,Burberry Group plc,,05.11.2024 г.,8.20$,▼ -0.26%,"1,144.00$",10.00$,-99.13%,SELL,4128133,196.21,0.06$,Линк,,Hold,976.00$,"1,376.50$",
,BTI,British American Tobacco P.l.c,,17.04.2025 г.,34.00$,▼ -0.97%,58.91$,47.00$,-20.22%,SELL,95819916,12.55,4.69$,Линк,,Hold,46.38$,67.30$,
,CALM,Cal-Maine Foods Inc,,02.12.2025 г.,81.00$,▼ -0.73%,77.73$,89.00$,14.50%,BUY,3682582,5.42,14.35$,Линк,,Hold,71.92$,126.40$,
,CAT,Caterpillar Inc,,06.06.2024 г.,260.00$,▲ +3.13%,985.82$,191.00$,-80.63%,SELL,454060710,49.04,20.10$,Линк,,Sell,357.73$,994.49$,
,CEG,Constellation Energy Corp,,05.06.2025 г.,293.00$,▲ +2.58%,274.06$,142.00$,-48.19%,SELL,98415493,23.81,11.51$,Линк,,Hold,240.51$,412.58$,
,CHD,Church & Dwight Co Inc,,08.10.2024 г.,100.00$,▼ -1.83%,95.63$,46.00$,-51.90%,SELL,22658916,31.54,3.03$,Линк,,Hold,81.33$,106.04$,
,CHTR,Charter Communications Inc,,06.11.2025 г.,218.00$,▼ -4.37%,126.23$,338.00$,167.77%,BUY,15524334,3.41,37.05$,Линк,,Buy,126.00$,422.01$,
,CL,Colgate-Palmolive Co,,02.05.2024 г.,92.45$,▼ -1.21%,89.48$,53.00$,-40.77%,SELL,71600941,34.72,2.58$,Линк,,Hold,74.55$,99.33$,
,CMCSA,Comcast Corp,,06.11.2025 г.,27.00$,▼ -1.15%,22.43$,45.00$,100.62%,BUY,80125075,4.41,5.08$,Линк,,Buy,22.38$,34.34$,
,CMG,Chipotle Mexican Grill Inc,,05.09.2024 г.,53.00$,▲ +1.98%,32.49$,25.00$,-23.05%,SELL,41676030,29.76,1.09$,Линк,,Hold,28.04$,58.42$,
,COST,Costco Wholesale Corp,,21.05.2024 г.,774.00$,▼ -1.46%,951.45$,353.00$,-62.90%,SELL,421947910,47.85,19.88$,Линк,,Hold,844.06$,"1,096.50$",
,CPRX,Catalyst Pharmaceuticals Inc,,08.07.2025 г.,20.87$,▼ -0.06%,31.38$,23.00$,-26.70%,SELL,3841530,18.04,1.74$,Линк,,Sell,19.05$,32.56$,
,CRM,Salesforce Inc,,14.04.2026 г.,240.00$,▼ -2.09%,151.78$,234.00$,54.17%,BUY,124307834,17.56,8.64$,Линк,,Buy,149.80$,276.80$,
Atten,CROX,Crocs Inc,,14.11.2024 г.,100.00$,▲ +0.42%,125.05$,207.00$,65.53%,BUY,6213690,-,-1.36$,Линк,,Sell,73.21$,129.79$,
,CRWD,Crowdstrike Holdings Inc,,14.01.2025 г.,349.00$,▲ +0.28%,684.86$,128.00$,-81.31%,SELL,174341245,-,-0.10$,Линк,,Hold,342.72$,785.66$,
Atten,CSCO,Cisco Systems Inc,,26.08.2025 г.,68.00$,▲ +1.88%,119.54$,37.00$,-69.05%,SELL,471159024,39.83,3.00$,Линк, 1.66 (1.39%) ,Hold,65.72$,130.37$,
,CSV,Carriage Services Inc,,15.03.2025 г.,78.84$,▲ +0.66%,38.16$,33.00$,-13.52%,SELL,605688,13.79,2.77$,Линк,,Buy,37.11$,52.10$,
,CVS,CVS Health Corp,,12.04.2023 г.,72.00$,▼ -0.85%,98.32$,77.00$,-21.68%,SELL,125449142,43.48,2.26$,Линк,,Sell,58.50$,102.77$,
,CVX,Chevron Corp,,20.07.2023 г.,156.00$,▼ -2.22%,173.63$,89.00$,-48.74%,SELL,345800997,30.14,5.76$,Линк, 7.14 (4.11%) ,Hold,142.40$,214.71$,
,D,Dominion Energy Inc,,12.06.2025 г.,55.00$,▲ +0.57%,68.41$,45.00$,-34.22%,SELL,60167447,20.24,3.38$,Линк,,Sell,54.05$,69.28$,
,DECK,Deckers Outdoor Corp,,26.09.2024 г.,82.00$,▲ +3.21%,109.11$,83.00$,-23.93%,SELL,15153306,15.53,7.02$,Линк,,Hold,78.91$,126.50$,
,DELL,Dell Technologies Inc,,23.12.2025 г.,128.00$,▼ -2.34%,409.50$,69.00$,-83.15%,SELL,265400267,32.52,12.59$,Линк,,Hold,110.22$,469.47$,
,DEO,Diageo PLC,,17.09.2024 г.,133.00$,▲ +2.04%,80.45$,89.00$,10.63%,BUY,34570665,18.58,4.33$,Линк,,Hold,72.45$,116.41$,
,DG,Dollar General Corp,,03.12.2024 г.,79.50$,▲ +4.38%,113.45$,79.00$,-30.37%,SELL,25025549,16.04,7.07$,Линк,,Hold,95.11$,158.23$,
,DHI,D.R. Horton Inc,,03.08.2023 г.,57.00$,▲ +3.50%,157.81$,113.00$,-28.39%,SELL,44751696,14.78,10.68$,Линк,,Hold,121.38$,184.55$,
,DIS,Walt Disney Co,,03.04.2025 г.,90.76$,▲ +3.00%,103.89$,51.00$,-50.91%,SELL,180406127,16.62,6.25$,Линк,,Hold,92.19$,124.69$,
,DKS,DICK'S Sporting Goods Inc,,27.05.2025 г.,174.00$,▲ +3.62%,232.96$,112.00$,-51.92%,SELL,20850515,22.15,10.52$,Линк,,Sell,170.73$,237.75$,
,DLTR,Dollar Tree Inc,,05.12.2024 г.,72.63$,▲ +4.92%,111.65$,53.00$,-52.53%,SELL,21456294,17.44,6.40$,Линк,,Hold,84.71$,142.40$,
,DOV,Dover Corp,,23.07.2024 г.,181.00$,▲ +1.26%,223.57$,73.00$,-67.35%,SELL,30106228,27.85,8.03$,Линк,,Hold,158.97$,237.54$,
,DOX,Amdocs Ltd,,27.06.2024 г.,78.00$,▼ -6.33%,51.47$,61.00$,18.52%,BUY,5536674,10.31,4.99$,Линк,,Buy,51.23$,95.41$,
,DPZ,Domino's Pizza Inc,,24.09.2024 г.,432.00$,▼ -0.60%,312.47$,322.00$,3.05%,BUY,10393333,17.97,17.39$,Линк,,Hold,297.48$,496.00$,
,DRI,Darden Restaurants Inc,,25.07.2024 г.,141.00$,▲ +1.00%,213.45$,136.00$,-36.28%,SELL,24447474,22.60,9.45$,Линк,,Hold,169.00$,228.27$,
,DUK,Duke Energy Corp,,19.06.2025 г.,114.00$,▲ +0.11%,123.86$,82.00$,-33.80%,SELL,96560786,18.96,6.53$,Линк,,Hold,113.90$,134.49$,
,DUOL,Duolingo Inc,,16.10.2025 г.,330.00$,▲ +1.76%,125.56$,,-100.00%,SELL,5850231,14.53,8.64$,Линк,,Hold,87.89$,483.03$,
,ECL,Ecolab Inc,,24.06.2025 г.,266.00$,▲ +0.02%,269.12$,96.00$,-64.33%,SELL,75740459,36.41,7.39$,Линк,,Hold,243.15$,309.27$,
,EL,Estee Lauder Companies Inc,,27.02.2025 г.,73.82$,▲ +2.85%,84.81$,41.00$,-51.66%,SELL,30683825,-,-0.70$,Линк,,Hold,66.22$,121.64$,
,ELF,elf Beauty Inc,,27.02.2025 г.,72.77$,▲ +3.08%,64.20$,43.00$,-33.02%,SELL,3816081,144.78,0.44$,Линк,,Hold,48.82$,150.99$,
,ENB,Enbridge Inc,,23.01.2024 г.,42.99$,▲ +0.15%,54.55$,25.00$,-54.17%,SELL,119268500,25.95,2.10$,Линк,,Hold,43.59$,58.45$,
Atten,ENPH,Enphase Energy Inc,,21.12.2023 г.,132.00$,▲ +9.42%,52.28$,130.00$,148.66%,BUY,6890410,52.45,1.00$,Линк,,Hold,25.78$,73.74$,
,ENVX,Enovix Corp,,21.10.2025 г.,12.00$,▲ +5.83%,7.08$,,-100.00%,SELL,1544527,-,-0.82$,Линк,,Hold,4.62$,16.49$,
,EPA:KER,Kering SA,,01.08.2024 г.,277.00$,▼ -0.80%,274.35$,276.00$,0.60%,BUY,33925909,-,-0.24$,Линк,,Hold,172.28$,354.20$,
,EPA:MC,LVMH Moet Hennessy Louis Vuitton SE,,29.07.2025 г.,621.90$,▲ +1.31%,511.60$,418.00$,-18.30%,SELL,254402524,23.43,21.84$,Линк,,Hold,436.55$,654.70$,
,EPA:OR,L'Oreal SA,,05.11.2024 г.,347.00$,▼ -0.99%,383.65$,169.00$,-55.95%,SELL,204250039,33.52,11.44$,Линк,,Hold,338.85$,408.35$,
,EPA:RMS,Hermes International SCA,,22.08.2024 г.,"2,199.00$",▲ +0.23%,"1,767.50$","1,149.00$",-34.99%,SELL,186541130,41.01,43.07$,Линк,,Hold,"1,529.00$","2,482.00$",
,EPA:SAN,Sanofi SA,,21.12.2023 г.,89.00$,▲ +2.44%,75.13$,75.00$,-0.17%,SELL,91032926,12.16,6.18$,Линк,,Buy,71.73$,91.15$,
,EPAM,EPAM Systems Inc,,11.11.2025 г.,181.00$,▼ -12.61%,76.64$,176.00$,129.65%,BUY,4004014,11.00,6.97$,Линк,,Buy,76.02$,222.53$,
,ETR:ADS,adidas AG,,08.08.2024 г.,215.00$,▼ -1.29%,175.65$,157.00$,-10.62%,SELL,31785829,22.57,7.79$,Линк,,Hold,129.95$,214.90$,
,ETR:DHL,DHL CAD Hedged CDR,,,44.00$,▲ +0.08%,52.02$,42.00$,-19.26%,SELL,60384712,16.93,3.07$,Линк,,Sell,36.99$,53.26$,
,ETR:DTE,Deutsche Telekom AG,,12.04.2023 г.,21.00$,▼ -0.37%,26.83$,30.00$,11.82%,BUY,132842037,14.80,1.81$,Линк,,Buy,26.00$,34.36$,
,ETR:PUM,Puma SE,,22.08.2024 г.,37.00$,▼ -0.99%,27.94$,41.00$,46.74%,BUY,4174172,-,-4.20$,Линк,,Hold,15.30$,30.31$,
,ETR:SAP,SAP SE,,12.04.2023 г.,122.00$,▲ +1.10%,136.34$,49.00$,-64.06%,SELL,168248883,21.85,6.24$,Линк,,Buy,134.40$,269.35$,
,FAST,Fastenal Co,,08.07.2025 г.,43.00$,▲ +2.25%,45.89$,18.00$,-60.78%,SELL,52683280,40.63,1.13$,Линк,,Hold,38.97$,50.63$,
,FDS,Factset Research Systems Inc,,18.09.2025 г.,317.00$,▼ -3.07%,221.29$,257.00$,16.14%,BUY,8061845,14.24,15.54$,Линк,,Hold,185.00$,453.41$,
,FDX,FedEx Corp,,01.04.2025 г.,219.00$,▲ +0.08%,326.20$,165.00$,-49.42%,SELL,77833508,17.38,18.77$,Линк,,Hold,174.01$,345.37$,
,FISV,Fiserv Inc,,12.02.2026 г.,59.44$,▼ -1.87%,47.86$,96.00$,100.59%,BUY,25521537,8.12,5.89$,Линк,,Buy,47.37$,70.41$,
,FLO,Flowers Foods Inc,,15.07.2025 г.,15.50$,▲ +6.14%,7.78$,16.00$,105.66%,BUY,1649306,22.66,0.34$,Линк,,Hold,6.80$,16.85$,
,FMC,FMC Corp,,09.01.2024 г.,56.11$,▼ -3.59%,11.55$,43.00$,272.29%,BUY,1444273,-,-20.02$,Линк,,Hold,10.72$,44.68$,
,FTNT,Fortinet Inc,,06.11.2025 г.,80.00$,▲ +0.41%,144.73$,58.00$,-59.93%,SELL,106036156,55.92,2.59$,Линк,,Sell,70.12$,150.07$,
,GIS,General Mills Inc,,14.08.2025 г.,50.00$,▲ +0.18%,33.42$,47.00$,40.63%,BUY,17835628,8.16,4.10$,Линк,,Hold,31.75$,54.18$,
,GOOGL,Alphabet Inc Class A,,05.02.2026 г.,324.00$,▲ +1.17%,368.03$,146.00$,-60.33%,SELL,4471222217,28.08,13.11$,Линк,,Hold,162.07$,408.61$,
,GPC,Genuine Parts Co,,02.05.2024 г.,122.62$,▲ +2.43%,108.70$,100.00$,-8.00%,SELL,14959783,252.32,0.43$,Линк,,Hold,90.78$,151.57$,
,GPN,Global Payments Inc,,23.10.2025 г.,87.00$,▲ +0.78%,66.88$,131.00$,95.87%,BUY,18294589,-,-2.03$,Линк,,Hold,61.16$,90.64$,
,GRMN,Garmin Ltd,,11.11.2025 г.,200.00$,▲ +1.00%,234.20$,104.00$,-55.59%,SELL,45166921,26.11,8.97$,Линк,,Hold,186.67$,273.32$,
,HALO,"Halozyme Therapeutics, Inc.",,29.10.2024 г.,50.59$,▼ -0.03%,68.55$,49.00$,-28.52%,SELL,8130915,24.66,2.78$,Линк,,Hold,51.06$,82.22$,
,HD,Home Depot Inc,,,320.00$,▲ +2.08%,334.28$,306.00$,-8.46%,SELL,333316169,23.75,14.08$,Линк,,Hold,289.10$,426.75$,
Atten,HEI.A,Heico Corp Class A,,22.05.2025 г.,210.00$,▼ -0.23%,247.58$,203.00$,-18.01%,SELL,39548741,44.22,5.60$,Линк,,Hold,199.35$,279.66$,
,HIMS,Hims & Hers Health Inc,,14.11.2024 г.,21.41$,▲ +11.23%,35.47$,17.00$,-52.07%,SELL,8209801,-,-0.09$,Линк,,Hold,13.74$,70.43$,
,HSY,Hershey Co,,03.04.2025 г.,165.00$,▼ -1.53%,172.63$,151.00$,-12.53%,SELL,35016840,32.14,5.37$,Линк,,Hold,160.07$,239.48$,
,IBM,IBM Common Stock,,23.12.2025 г.,303.00$,▼ -5.05%,249.10$,144.00$,-42.19%,SELL,234125409,22.03,11.31$,Линк,,Hold,212.34$,332.46$,
,INGR,Ingredion Inc,,24.09.2024 г.,136.00$,▼ -0.92%,97.93$,118.00$,20.49%,BUY,6175374,9.43,10.39$,Линк,,Buy,97.12$,140.47$,
Atten,INTC,Intel Corp,,14.03.2024 г.,24.28$,▲ +10.64%,133.99$,26.00$,-80.60%,SELL,673433768,-,-0.63$,Линк,,Sell,18.97$,135.48$,
,IREN,IREN Ltd,,16.10.2025 г.,62.00$,▲ +3.18%,59.96$,,-100.00%,SELL,21428427,135.62,0.44$,Линк,,Hold,9.82$,76.87$,
,IT,Gartner Inc,,02.10.2025 г.,256.00$,▼ -4.56%,127.49$,323.00$,153.35%,BUY,8535696,12.60,10.12$,Линк,,Buy,126.17$,409.76$,
,ITW,Illinois Tool Works Inc,,11.01.2024 г.,266.64$,▲ +0.76%,264.09$,117.00$,-55.70%,SELL,75978692,24.52,10.77$,Линк,,Hold,238.82$,303.15$,
Sell,JNJ,Johnson & Johnson,,13.06.2024 г.,145.00$,▼ -2.48%,228.39$,117.00$,-48.77%,SELL,549784061,26.42,8.65$,Линк,,Hold,149.04$,251.71$,
,KHC ,Kraft Heinz Co,,14.08.2025 г.,28.00$,▼ -1.64%,22.82$,29.00$,27.08%,BUY,27059431,-,-4.86$,Линк,,Hold,21.04$,29.19$,
Sell,KO,Coca-Cola Co,,24.10.2023 г.,55.00$,▼ -0.68%,79.39$,38.00$,-52.14%,SELL,341574043,24.99,3.18$,Линк,,Hold,65.35$,84.04$,
,KR,Kroger Co,,21.05.2024 г.,54.00$,▼ -8.43%,56.61$,50.00$,-11.68%,SELL,34903496,36.75,1.54$,Линк,,Buy,56.32$,76.58$,
Watch,LAMR,Lamar Advertising Co,,26.08.2025 г.,126.00$,▲ +0.37%,149.65$,123.00$,-17.81%,SELL,15185748,27.64,5.41$,Линк,,Hold,113.66$,158.69$,
Atten,LEG,Leggett & Platt Inc,,09.04.2024 г.,11.55$,▲ +2.04%,10.99$,28.00$,154.78%,BUY,1499392,6.85,1.60$,Линк,,Hold,7.86$,13.00$,
,LKQ,LKQ Corp,,16.01.2025 г.,38.00$,▲ +3.12%,25.80$,38.00$,47.29%,BUY,6573602,12.84,2.01$,Линк,,Hold,23.98$,39.77$,
Watch,LLY,Eli Lilly And Co,,,463.00$,▼ -1.21%,"1,098.57$",121.00$,-88.99%,SELL,1034568360,39.03,28.15$,Линк,,Hold,623.78$,"1,182.73$",
,LNTH,Lantheus Holdings Inc,,29.10.2024 г.,110.00$,▲ +0.65%,103.86$,108.00$,3.99%,BUY,6761916,25.07,4.14$,Линк,,Sell,47.27$,107.99$,
,LOGI,Logitech International SA,,05.12.2024 г.,84.47$,▲ +1.60%,107.64$,76.00$,-29.39%,SELL,14077255,22.43,4.80$,Линк,,Hold,83.38$,129.62$,
,LOW,Lowe's Companies Inc,,12.10.2023 г.,199.00$,▲ +2.27%,222.20$,187.00$,-15.84%,SELL,124589071,18.79,11.83$,Линк,,Hold,203.40$,293.06$,
,LRCX,Lam Research Corp,,19.09.2024 г.,75.50$,▲ +3.97%,389.04$,69.00$,-82.26%,SELL,486522153,73.43,5.30$,Линк,,Sell,87.75$,401.00$,
,LULU,Lululemon Athletica Inc,,18.09.2025 г.,170.00$,▲ +0.01%,111.77$,198.00$,77.15%,BUY,12691919,9.03,12.38$,Линк, 0.00 ,Buy,109.36$,252.24$,
,LW,Lamb Weston Holdings Inc,,16.04.2024 г.,74.61$,▲ +2.32%,45.06$,51.00$,13.18%,BUY,6221556,21.04,2.14$,Линк,,Hold,37.62$,67.07$,
,MA,Mastercard Inc,,10.09.2024 г.,285.00$,▼ -0.65%,489.79$,309.00$,-36.91%,SELL,432770517,28.34,17.28$,Линк,,Hold,464.52$,601.77$,
,MCD,McDonald's Corp,,23.05.2024 г.,260.00$,▼ -1.84%,278.61$,183.00$,-34.32%,SELL,197954038,22.97,12.13$,Линк,,Buy,271.85$,341.75$,
,MDLZ,MONDELEZ INTERNATIONAL INC Common Stock,,23.11.2023 г.,71.00$,▼ -1.22%,60.12$,38.00$,-36.79%,SELL,77172977,29.81,2.02$,Линк,,Hold,51.20$,71.15$,
,MDT,Medtronic PLC,,11.05.2023 г.,88.00$,▲ +1.54%,79.34$,71.00$,-10.51%,SELL,101863431,21.29,3.73$,Линк,,Hold,73.31$,106.33$,
Watch,MEDP,Medpace Holdings Inc,,10.12.2024 г.,348.00$,▲ +0.68%,460.20$,310.00$,-32.64%,SELL,13143170,28.95,15.89$,Линк,,Hold,301.90$,628.92$,
,MELI,MercadoLibre Inc,,10.12.2024 г.,"1,858.00$",▲ +0.20%,"1,635.15$","2,198.00$",34.42%,BUY,82897479,43.17,37.88$,Линк,,Hold,"1,495.00$","2,645.22$",
,META,Meta Platforms Inc,,07.04.2026 г.,569.00$,▲ +1.70%,577.22$,444.00$,-23.08%,SELL,1465227872,20.98,27.52$,Линк,,Hold,520.26$,796.25$,
,MKC,McCormick & Company Inc,,08.10.2024 г.,79.60$,▲ +0.32%,46.64$,56.00$,20.07%,BUY,12533478,7.65,6.10$,Линк,,Buy,44.82$,78.16$,
Atten,MMM,3M Co,,18.01.2024 г.,128.25$,▲ +0.86%,160.60$,108.00$,-32.75%,SELL,83763696,30.98,5.18$,Линк,,Hold,139.34$,177.41$,
,MNST,Monster Beverage Corp,,20.06.2024 г.,48.78$,▼ -0.35%,91.34$,28.00$,-69.35%,SELL,89331256,44.33,2.06$,Линк,,Sell,58.09$,93.92$,
Watch,MO,Altria Group Inc,,17.04.2025 г.,41.00$,▲ +0.25%,69.12$,57.00$,-17.53%,SELL,115422871,14.45,4.78$,Линк,,Hold,54.70$,74.56$,
,MRK,Merck & Co Inc,,20.11.2025 г.,94.41$,▼ -1.36%,113.87$,64.00$,-43.80%,SELL,281238866,32.04,3.55$,Линк,,Hold,76.66$,125.14$,
,MSFT,Microsoft Corp,,07.04.2026 г.,370.00$,▲ +0.13%,379.40$,250.00$,-34.11%,SELL,2818347814,22.60,16.79$,Линк, 3.68 (0.97%) ,Hold,356.28$,555.45$,
,MU,Micron Technology Inc,,14.03.2024 г.,97.76$,▲ +8.70%,"1,133.99$",43.00$,-96.21%,SELL,1278839068,53.54,21.18$,Линк,,Sell,103.38$,"1,149.43$",
,NBIS,Nebius Group NV,,13.11.2025 г.,89.00$,▲ +2.06%,286.69$,,-100.00%,SELL,72790047,104.94,2.73$,Линк,,Sell,43.89$,298.80$,
Sell,NEE,NextEra Energy Inc,,17.06.2025 г.,71.00$,▲ +1.19%,86.75$,57.00$,-34.29%,SELL,180926234,22.02,3.94$,Линк,,Hold,67.20$,98.75$,
,NFLX,Netflix Inc,,29.01.2026 г.,82.68$,▲ +0.55%,77.38$,41.00$,-47.01%,SELL,325831615,25.00,3.09$,Линк,,Buy,75.01$,134.12$,
,NKE,Nike Inc,,13.05.2025 г.,62.00$,▲ +2.29%,45.20$,50.00$,10.62%,BUY,66936094,29.73,1.52$,Линк,,Hold,41.35$,80.17$,
Sell,NVDA,NVIDIA Corp,,25.11.2025 г.,175.85$,▲ +2.95%,210.69$,106.00$,-49.69%,SELL,5098698059,32.27,6.53$,Линк,,Hold,142.03$,236.54$,
Atten,NVO,Novo Nordisk A/S,,02.12.2025 г.,87.63$,▼ -0.76%,43.19$,44.00$,1.88%,BUY,149211123,10.24,4.22$,Линк,,Hold,35.12$,74.38$,
,NVR,NVR Inc,,05.12.2023 г.,6.37$,▲ +3.43%,"6,490.93$","8,153.00$",25.61%,BUY,17520909,15.82,410.23$,Линк,,Hold,"5,501.01$","8,618.28$",
Sell,NXST,Nexstar Media Group Inc,,01.04.2025 г.,177.00$,▼ -1.00%,164.16$,295.00$,79.70%,BUY,5013276,35.44,4.63$,Линк,,Buy,163.46$,254.20$,
,OKTA,Okta Inc,,09.01.2025 г.,85.46$,▲ +4.23%,117.81$,84.00$,-28.70%,SELL,20476238,82.07,1.44$,Линк,,Hold,62.66$,142.35$,
,ON ,ON Semiconductor Corp,,24.10.2024 г.,68.00$,▲ +7.70%,121.62$,46.00$,-62.18%,SELL,47663268,86.85,1.40$,Линк,,Hold,44.56$,134.92$,
,ONON,On Holding AG,,24.09.2024 г.,51.00$,▲ +3.08%,38.88$,34.00$,-12.55%,SELL,12959859,41.61,0.93$,Линк,,Hold,31.41$,55.95$,
,ORCL,Oracle Corp,,19.12.2023 г.,106.00$,▲ +0.38%,184.29$,46.00$,-75.04%,SELL,530026498,31.43,5.86$,Линк,,Hold,134.57$,345.72$,
,PANW,Palo Alto Networks Inc,,13.08.2024 г.,165.50$,▲ +2.00%,287.78$,109.50$,-61.95%,SELL,234540728,236.96,1.21$,Линк,,Hold,139.57$,302.95$,
,PAYC,Paycom Software Inc,,18.06.2024 г.,141.00$,▲ +0.91%,124.85$,104.00$,-16.70%,SELL,5821393,14.45,8.64$,Линк,,Hold,104.90$,248.95$,
Sell,PEP,PepsiCo Inc,,22.07.2025 г.,166.00$,▲ +0.30%,142.02$,95.00$,-33.11%,SELL,194108397,22.31,6.36$,Линк,,Hold,127.60$,171.48$,
Atten,PFE,Pfizer Inc,,20.11.2025 г.,24.42$,▼ -2.74%,25.21$,23.00$,-8.77%,SELL,143682978,19.26,1.31$,Линк,,Hold,23.11$,28.75$,
,PG,Procter & Gamble Co,,,152.00$,▼ -0.12%,150.38$,87.00$,-42.15%,SELL,350174729,21.99,6.84$,Линк,,Hold,137.62$,167.25$,
Sell,PM,Philip Morris International Inc.,,23.11.2023 г.,93.00$,▼ -0.58%,178.40$,71.00$,-60.20%,SELL,278046738,25.12,7.10$,Линк,,Hold,142.11$,193.05$,
,POOL,Pool Corp,,13.03.2025 г.,326.00$,▲ +2.39%,198.99$,247.00$,24.13%,BUY,7251793,18.31,10.87$,Линк,,Hold,172.68$,345.00$,
,PYPL,PayPal Holdings Inc,,16.12.2025 г.,61.29$,▲ +1.02%,42.51$,61.00$,43.50%,BUY,37498303,7.96,5.34$,Линк,,Hold,38.46$,79.50$,
Sell,QCOM,Qualcomm Inc,,06.02.2025 г.,167.00$,▲ +6.17%,226.11$,117.00$,-48.26%,SELL,238319941,24.59,9.19$,Линк,,Hold,121.99$,259.92$,
,QLYS,Qualys Inc,,14.01.2025 г.,133.00$,▼ -0.78%,111.30$,127.00$,14.11%,BUY,3919652,19.99,5.57$,Линк,,Hold,74.51$,155.03$,
,RACE,Ferrari NV,,04.04.2024 г.,387.00$,▲ +2.22%,362.13$,236.00$,-34.83%,SELL,61405843,-,-,Линк, 4.41 (1.22%) ,Hold,312.51$,519.10$,
,SBUX,Starbucks Corp,,16.04.2024 г.,98.93$,▲ +0.83%,100.65$,68.00$,-32.44%,SELL,114710807,76.81,1.31$,Линк,,Hold,77.99$,108.88$,
,SCI,Service Corporation International,,14.03.2025 г.,78.84$,▲ +0.07%,72.62$,51.00$,-29.77%,SELL,10019454,19.16,3.79$,Линк, 1.36 (1.87%) ,Hold,68.41$,88.67$,
Atten,SEDG,Solaredge Technologies Inc,,05.09.2023 г.,162.00$,▲ +6.16%,58.05$,147.00$,153.23%,BUY,3530496,-,-6.13$,Линк,,Hold,15.75$,81.25$,
,SFM,Sprouts Farmers Market Inc,,04.06.2024 г.,78.00$,▲ +1.04%,80.49$,53.00$,-34.15%,SELL,7569626,15.47,5.20$,Линк,,Hold,64.75$,173.96$,
Atten,SIRI,Sirius XM Holdings Inc,,22.10.2024 г.,27.00$,▲ +0.36%,28.03$,37.00$,32.00%,BUY,9435456,11.63,2.41$,Линк,,Hold,19.77$,30.11$,
,SMCI,Super Micro Computer Inc,,12.02.2026 г.,30.79$,▲ +10.37%,30.66$,18.00$,-41.29%,SELL,19831875,16.71,1.84$,Линк,,Hold,19.49$,62.36$,
,SNA,Snap-On Inc,,07.12.2023 г.,280.00$,▲ +1.57%,387.25$,236.00$,-39.06%,SELL,20060290,19.99,19.37$,Линк,,Sell,301.82$,400.88$,
,SOFI,SoFi Technologies Inc,,17.07.2025 г.,,▲ +2.81%,17.91$,,-100.00%,SELL,22973891,40.60,0.44$,Линк,,Hold,14.64$,32.73$,
,STMPA,STMicroelectronics NV,,08.10.2024 г.,28.00$,▲ +0.41%,68.16$,29.00$,-57.45%,SELL,62649810,-,-,Линк,,Sell,18.20$,69.72$,
,STO:EVO,Evolution AB (publ),,03.10.2024 г.,87.00$,0.00%,692.60$,111.00$,-83.97%,SELL,138709213,12.04,57.51$,Линк,,Hold,515.40$,887.60$,
,STZ,Constellation Brands Inc,,22.05.2025 г.,184.00$,▲ +1.60%,141.18$,134.00$,-5.09%,SELL,24211352,14.70,9.61$,Линк, 4.22 (2.99%) ,Hold,126.45$,178.14$,
,SWX:NESN,Nestle SA,,16.04.2024 г.,93.00$,▲ +0.49%,79.35$,68.00$,-14.30%,SELL,204421087,22.60,3.51$,Линк,,Hold,69.90$,85.06$,
,SWX:ROG,#N/A,-,25.04.2023 г.,282.00$,-,#N/A,258.00$,#N/A,#N/A,#N/A,-,-,Линк,,#N/A,-,-,
,SYY,Sysco Corp,,09.05.2024 г.,75.00$,▼ -0.38%,78.70$,58.00$,-26.30%,SELL,37632969,21.83,3.61$,Линк,,Hold,68.19$,91.85$,
,TER,Teradyne Inc,,24.10.2024 г.,124.00$,▲ +7.19%,437.92$,45.00$,-89.72%,SELL,68552919,81.05,5.40$,Линк,,Sell,84.24$,440.75$,
,TGT,Target Corp,,18.03.2025 г.,133.00$,▲ +2.29%,130.74$,98.00$,-25.04%,SELL,59380947,17.26,7.57$,Линк,,Hold,83.44$,137.87$,
,TMO,Thermo Fisher Scientific Inc,,12.12.2024 г.,526.00$,▲ +0.63%,464.61$,336.00$,-27.68%,SELL,172659013,25.56,18.17$,Линк,,Hold,390.50$,643.99$,
,TSLA,Tesla Inc,,24.07.2025 г.,304.00$,▲ +1.04%,400.49$,59.00$,-85.27%,SELL,1254923370,365.96,1.09$,Линк,,Hold,288.77$,498.82$,
,TSM,Taiwan Semicndctr Mnufctrng Co Ltd,,22.04.2025 г.,189.75$,▲ +6.94%,462.12$,98.00$,-78.79%,SELL,2098618140,38.73,11.93$,Линк,,Sell,206.20$,465.22$,
,TXN,Texas Instruments Inc,,23.11.2023 г.,154.00$,▲ +6.95%,322.86$,130.00$,-59.73%,SELL,293832516,55.22,5.85$,Линк,,Sell,152.76$,331.51$,
Watch,UBER,Uber Technologies Inc,,15.02.2026 г.,92.00$,▲ +1.03%,71.64$,75.00$,4.69%,BUY,145830239,17.80,4.03$,Линк,,Hold,67.19$,101.99$,
,UL,Unilever PLC,,14.05.2024 г.,54.00$,▲ +1.11%,58.40$,50.00$,-14.38%,SELL,95107865,19.66,2.97$,Линк,,Hold,54.75$,74.97$,
,ULTA,Ulta Beauty Inc,,21.05.2024 г.,378.00$,▲ +1.19%,456.13$,471.00$,3.26%,BUY,19608710,17.09,26.68$,Линк,,Buy,448.57$,714.97$,
Atten,UNH,UnitedHealth Group Inc,,29.01.2026 г.,291.00$,▲ +0.36%,400.96$,187.00$,-53.36%,SELL,364129531,30.28,13.24$,Линк,,Sell,234.60$,415.98$,
Sell,UPS,United Parcel Service Inc,,07.08.2025 г.,87.00$,▼ -0.26%,104.86$,82.00$,-21.80%,SELL,89131651,16.98,6.18$,Линк,,Hold,82.00$,122.41$,
,V,Visa Inc,,10.09.2024 г.,285.00$,▼ -0.95%,327.24$,199.00$,-39.19%,SELL,616560719,28.51,11.48$,Линк,,Hold,293.89$,359.66$,
,VC,Visteon Corp,,16.05.2023 г.,137.00$,▲ +3.09%,113.81$,44.00$,-61.34%,SELL,3038046,18.84,6.04$,Линк,,Hold,83.49$,129.10$,
,VC,Visteon Corp,,16.05.2023 г.,137.00$,▲ +3.09%,113.81$,44.00$,-61.34%,SELL,3038046,18.84,6.04$,Линк,,Hold,83.49$,129.10$,
,VST,Vistra Corp,,10.06.2025 г.,164.00$,▲ +3.10%,163.75$,98.00$,-40.15%,SELL,55213618,27.45,5.97$,Линк,,Hold,132.66$,219.82$,
,VZ,Verizon Communications Inc,,09.09.2025 г.,43.50$,▼ -1.03%,45.37$,46.00$,1.39%,BUY,189445062,11.06,4.10$,Линк,,Hold,38.39$,51.68$,
Atten,WBD,Warner Bros Discovery Inc,,15.10.2024 г.,7.69$,▼ -0.15%,26.20$,17.00$,-35.11%,SELL,65686965,-,-0.70$,Линк,,Hold,10.27$,30.00$,
,WHR,Whirlpool Corp,,09.01.2024 г.,109.69$,▲ +0.57%,38.86$,126.00$,224.24%,BUY,2519026,13.24,2.94$,Линк,,Buy,38.20$,111.96$,
,WM,Waste Management Inc,,18.01.2024 г.,219.19$,▼ -0.58%,214.60$,76.00$,-64.59%,SELL,86178148,31.07,6.91$,Линк,,Hold,194.11$,248.13$,
,WMT,Walmart Inc,,14.11.2023 г.,59.00$,▼ -0.80%,117.18$,20.00$,-82.93%,SELL,932527700,41.28,2.84$,Линк,,Hold,94.23$,135.16$,
,WSM,Williams-Sonoma Inc,,11.01.2024 г.,138.13$,▲ +2.61%,226.92$,92.00$,-59.46%,SELL,26719036,25.40,8.93$,Линк,,Sell,154.11$,234.42$,
,WSO,Watsco Inc,,06.06.2024 г.,462.00$,▲ +4.33%,401.04$,336.00$,-16.22%,SELL,16107652,33.03,12.14$,Линк, 11.37 (2.83%) ,Hold,323.05$,494.94$,
,XOM,Exxon Mobil Corp,,,106.00$,▼ -2.08%,137.81$,71.00$,-48.48%,SELL,571215136,23.25,5.93$,Линк,,Hold,105.53$,176.41$,
,ZETA,Zeta Global Holdings Corp,,13.11.2025 г.,18.00$,▲ +2.16%,18.90$,,-100.00%,SELL,4710969,-,-0.10$,Линк,,Hold,13.74$,25.95$,
Atten,ZTS,Zoetis Inc,,11.11.2025 г.,120.00$,▲ +1.88%,78.71$,83.00$,5.45%,BUY,32997435,13.04,6.04$,Линк,,Hold,72.38$,161.77$,
Sell,IONQ,IONQ Inc,,04.12.2025 г.,57.77$,▲ +3.40%,56.55$,,-100.00%,SELL,21108407,964.85,0.06$,Линк,,Hold,25.89$,84.64$,
Atten,RGTI,Rigetti Computing Inc,,05.12.2025 г.,27.78$,▲ +5.51%,21.36$,,-100.00%,SELL,7098285,-,-0.71$,Линк, 0.00 ,Hold,10.30$,58.15$,
Atten,QBTS,D-Wave Quantum Inc,,11.12.2025 г.,27.51$,▲ +7.72%,24.69$,,-100.00%,SELL,9146292,-,-1.13$,Линк,,Hold,12.75$,46.75$,
Watch,ISRG,Intuitive Surgical Inc,,27.01.2026 г.,526.00$,▲ +1.14%,406.78$,139.00$,-65.83%,SELL,144066343,49.34,8.24$,Линк,,Buy,396.68$,603.88$,
,NOW,ServiceNow Inc,,17.03.2026 г.,117.00$,▼ -0.46%,95.04$,73.00$,-23.19%,SELL,98015513,56.53,1.68$,Линк,,Hold,81.24$,211.48$,
,OPRA,Opera Ltd,,18.03.2026 г.,14.75$,▼ -1.44%,18.52$,15.00$,-19.01%,SELL,1658521,14.73,1.26$,Линк,,Hold,11.71$,21.06$,
,ADSK,Autodesk Inc,,19.03.2026 г.,247.00$,▲ +0.39%,193.82$,164.00$,-15.39%,SELL,40896022,28.35,6.84$,Линк,,Buy,190.86$,329.09$,
Watch,INTU,Intuit Inc,,28.04.2026 г.,401.00$,▼ -0.77%,267.00$,370.00$,38.58%,BUY,73034379,16.17,16.51$,,,Buy,259.23$,813.48$,
,EXPE,Expedia Group Inc,,05.05.2026 г.,247.00$,▲ +0.60%,240.90$,318.00$,32.00%,BUY,28913299,21.22,11.35$,,,Hold,160.00$,303.80$,
,HRB,H & R Block Inc,,05.05.2026 г.,36.00$,▼ -2.66%,34.38$,43.00$,25.07%,BUY,4358012,6.09,5.65$,,,Hold,28.16$,57.55$,`;

// Helper to parse a single column value safely, removing quotes and currency symbols if numerical parsing is expected
function cleanNum(val: string): number | null {
  if (!val) return null;
  const clean = val.replace(/[$,\s""]/g, '').trim();
  if (clean === '-' || clean === '#N/A' || clean === '') return null;
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

export function parseCSVData(csvText: string): { stocks: Stock[]; indices: MarketIndex[] } {
  const lines = csvText.split('\n');
  const stocks: Stock[] = [];
  const indices: MarketIndex[] = [
    // US Markets
    { name: 'S&P 500', value: 7346.17, changePct: -0.16, ticker: '^GSPC', changeVal: -12.05, category: 'US Markets' },
    { name: 'NASDAQ 100', value: 29397.01, changePct: 0.61, ticker: '^NDX', changeVal: 176.95, category: 'US Markets' },
    { name: 'NASDAQ Composite', value: 25309.15, changePct: -0.66, ticker: '^IXIC', changeVal: -167.49, category: 'US Markets' },
    { name: 'Dow Jones Industrial Average', value: 51904.74, changePct: 0.11, ticker: '^DJI', changeVal: 55.84, category: 'US Markets' },
    { name: 'CBOE Volatility Index', value: 19.25, changePct: 3.33, ticker: '^VIX', changeVal: 0.62, category: 'US Markets' },

    // European Markets
    { name: 'FTSE 100', value: 10536.79, changePct: 0.72, ticker: '^FTSE', changeVal: 75.16, category: 'European Markets' },
    { name: 'CAC 40', value: 8431.61, changePct: 0.55, ticker: '^FCHI', changeVal: 46.12, category: 'European Markets' },
    { name: 'DAX Performance Index', value: 24961.00, changePct: 1.13, ticker: '^GDAXI', changeVal: 279.00, category: 'European Markets' },
    { name: 'Euronext 100', value: 1909.37, changePct: 0.54, ticker: '^N100', changeVal: 10.34, category: 'European Markets' },
    { name: 'Euro STOXX 50', value: 6253.03, changePct: 0.62, ticker: '^STOXX50E', changeVal: 38.33, category: 'European Markets' },

    // Asian Markets
    { name: 'SSE Composite Index', value: 4120.28, changePct: 0.23, ticker: '000001.SS', changeVal: 9.47, category: 'Asian Markets' },
    { name: 'Nikkei 225', value: 72366.34, changePct: 4.61, ticker: '^N225', changeVal: 3191.37, category: 'Asian Markets' },
    { name: 'Hang Seng Index', value: 23076.91, changePct: -1.43, ticker: '^HSI', changeVal: -335.28, category: 'Asian Markets' },
    { name: 'S&P/ASX 200', value: 8748.70, changePct: -0.68, ticker: '^AXJO', changeVal: -59.70, category: 'Asian Markets' },
    { name: 'KOSPI Composite Index', value: 8930.30, changePct: 0.00, ticker: '^KS11', changeVal: 0.00, category: 'Asian Markets' },

    // Commodities
    { name: 'Crude Oil', value: 71.80, changePct: 2.08, ticker: 'CL=F', changeVal: 1.46, category: 'Commodities' },
    { name: 'Brent Crude Oil', value: 75.26, changePct: 2.06, ticker: 'BZ=F', changeVal: 1.52, category: 'Commodities' },
    { name: 'Gold Futures', value: 4051.90, changePct: 1.08, ticker: 'GC=F', changeVal: 43.10, category: 'Commodities' },
    { name: 'Silver Futures', value: 58.35, changePct: 0.45, ticker: 'SI=F', changeVal: 0.26, category: 'Commodities' },
    { name: 'Copper', value: 6.08, changePct: 1.11, ticker: 'HG=F', changeVal: 0.07, category: 'Commodities' },
    { name: 'Natural Gas', value: 3.31, changePct: 1.53, ticker: 'NG=F', changeVal: 0.05, category: 'Commodities' },
    { name: 'Platinum', value: 1600.65, changePct: 0.16, ticker: 'PL=F', changeVal: 2.55, category: 'Commodities' },

    // Currencies & Crypto
    { name: 'EUR/USD', value: 1.14, changePct: 0.13, ticker: 'EURUSD=X', changeVal: 0.00, category: 'Currencies & Crypto' },
    { name: 'USD/JPY', value: 161.80, changePct: 0.03, ticker: 'JPY=X', changeVal: 0.05, category: 'Currencies & Crypto' },
    { name: 'USD/GBP', value: 0.76, changePct: -0.22, ticker: 'GBP=X', changeVal: -0.00, category: 'Currencies & Crypto' },
    { name: 'USD/AUD', value: 1.45, changePct: -0.20, ticker: 'USDAUD=X', changeVal: -0.00, category: 'Currencies & Crypto' },
    { name: 'USD/CAD', value: 1.42, changePct: -0.23, ticker: 'USDCAD=X', changeVal: -0.00, category: 'Currencies & Crypto' },
    { name: 'USD/MXN', value: 17.52, changePct: -0.52, ticker: 'USDMXN=X', changeVal: -0.09, category: 'Currencies & Crypto' },
    { name: 'USD/HKD', value: 7.84, changePct: 0.02, ticker: 'USDHKD=X', changeVal: 0.00, category: 'Currencies & Crypto' },
    { name: 'Bitcoin USD', value: 59544.41, changePct: -2.36, ticker: 'BTC-USD', changeVal: -1439.02, category: 'Currencies & Crypto' },
  ];

  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().startsWith('watch,ticker,company name')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    // Return empty fallback if no header found or custom format upload starts,
    // although they should upload matching schema
    return { stocks, indices };
  }

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Standard RFC 4180 CSV line parser to handle quotes and commas inside them
    const cells: string[] = [];
    let currentCell = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());

    if (cells.length < 2 || !cells[1]) continue; // Needs at least a Ticker

    const watch = cells[0];
    const ticker = cells[1].trim().toUpperCase();
    const companyName = cells[2] || '';
    // cells[3] is 365 Chart sparkline column
    const date = cells[4] || '';
    const priceOfCalc = cleanNum(cells[5]);

    // parse daily change percentage (e.g., "▲ +0.70%" or "▼ -2.14%" or "▲ 1.22%")
    let dailyChangePct = 0;
    const changeCell = cells[6] || '';
    const cleanChange = changeCell.replace(/[▲▼+%\s]/g, '').trim();
    if (cleanChange && !isNaN(parseFloat(cleanChange))) {
      const isDown = changeCell.includes('▼') || changeCell.includes('-');
      dailyChangePct = parseFloat(cleanChange) * (isDown ? -1 : 1);
    }

    const currentPrice = cleanNum(cells[7]) || 100.00; // default to safe positive scale
    const fairPrice = cleanNum(cells[8]);

    // Difference formula calculation in app: (Fair Price - Current Price) / Current Price
    let difference = cells[9] ? parseFloat(cells[9].replace(/[%\s]/g, '')) : null;
    if (fairPrice !== null && currentPrice > 0) {
      difference = parseFloat((((fairPrice - currentPrice) / currentPrice) * 100).toFixed(2));
    }

    let buySell = cells[10] ? cells[10].trim().toUpperCase() : 'SELL';
    if (fairPrice !== null && currentPrice > 0) {
      const dev = ((currentPrice - fairPrice) / fairPrice) * 100;
      if (dev < -10) {
        buySell = 'BUY';
      } else if (dev > 10) {
        buySell = 'SELL';
      } else {
        buySell = 'ДРУГИ';
      }
    }

    const marketCap = cleanNum(cells[11]);
    const peRatio = cleanNum(cells[12]);
    const eps = cleanNum(cells[13]);
    const profileLink = cells[14] || '';
    const dividend = cells[15] || '';
    const signal = cells[16] || 'Hold';
    const low52 = cleanNum(cells[17]);
    const high52 = cleanNum(cells[18]);
    const calcLink = cells[19] || '';

    // Avoid duplicate insertions
    if (!stocks.some(s => s.ticker === ticker)) {
      stocks.push({
        watch,
        ticker,
        companyName,
        date,
        priceOfCalc,
        dailyChangePct,
        currentPrice,
        fairPrice,
        difference,
        buySell,
        marketCap,
        peRatio,
        eps,
        profileLink,
        dividend,
        signal,
        low52,
        high52,
        calcLink,
      });
    }
  }

  return { stocks, indices };
}
