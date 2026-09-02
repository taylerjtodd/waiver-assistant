import { ParsedRankingItem } from './types';
import { parseRankingsCsv } from './csvParser';

export const SAMPLE_CSV_CONTENT = `RK,PLAYER NAME,POS,TEAM,BYE,TIER
1,Christian McCaffrey,RB,SF,9,1
2,CeeDee Lamb,WR,DAL,7,1
3,Tyreek Hill,WR,MIA,6,1
4,Ja'Marr Chase,WR,CIN,12,1
5,Justin Jefferson,WR,MIN,6,1
6,Amon-Ra St. Brown,WR,DET,5,1
7,Breece Hall,RB,NYJ,12,1
8,Bijan Robinson,RB,ATL,12,1
9,A.J. Brown,WR,PHI,5,2
10,Garrett Wilson,WR,NYJ,12,2
11,Jonathan Taylor,RB,IND,14,2
12,Puka Nacua,WR,LAR,6,2
13,Saquon Barkley,RB,PHI,5,2
14,Jahmyr Gibbs,RB,DET,5,2
15,Kyren Williams,RB,LAR,6,2
16,Marvin Harrison Jr.,WR,ARI,11,3
17,Drake London,WR,ATL,12,3
18,Chris Olave,WR,NO,12,3
19,Travis Etienne Jr.,RB,JAX,12,3
20,Nico Collins,WR,HOU,14,3
21,Derrick Henry,RB,BAL,14,3
22,Josh Allen,QB,BUF,12,3
23,Deebo Samuel Sr.,WR,SF,9,3
24,Mike Evans,WR,TB,11,3
25,Sam LaPorta,TE,DET,5,3
26,Isiah Pacheco,RB,KC,6,4
27,Travis Kelce,TE,KC,6,4
28,Jalen Hurts,QB,PHI,5,4
29,Patrick Mahomes,QB,KC,6,4
30,Lamar Jackson,QB,BAL,14,4
31,Brandon Aiyuk,WR,SF,9,4
32,Josh Jacobs,RB,GB,10,4
33,DK Metcalf,WR,SEA,10,4
34,Trey McBride,TE,ARI,11,4
35,De'Von Achane,RB,MIA,6,4
36,James Cook,RB,BUF,12,4
37,Davante Adams,WR,LV,10,4
38,Michael Pittman Jr.,WR,IND,14,4
39,Joe Mixon,RB,HOU,14,4
40,Mark Andrews,TE,BAL,14,4
41,Rachaad White,RB,TB,11,5
42,Kenneth Walker III,RB,SEA,10,5
43,Alvin Kamara,RB,NO,12,5
44,CJ Stroud,QB,HOU,14,5
45,Amari Cooper,WR,CLE,10,5
46,Tee Higgins,WR,CIN,12,5
47,Cooper Kupp,WR,LAR,6,5
48,Dalton Kincaid,TE,BUF,12,5
49,George Kittle,TE,SF,9,5
50,James Conner,RB,ARI,11,5
51,David Montgomery,RB,DET,5,5
52,Zay Flowers,WR,BAL,14,5
53,Terry McLaurin,WR,WAS,14,5
54,Rashee Rice,WR,KC,6,5
55,Tank Dell,WR,HOU,14,5
56,Kyle Pitts,TE,ATL,12,6
57,Jaylen Waddle,WR,MIA,6,6
58,George Pickens,WR,PIT,9,6
59,D'Andre Swift,RB,CHI,7,6
60,Keenan Allen,WR,CHI,7,6
61,Evan Engram,TE,JAX,12,6
62,Raheem Mostert,RB,MIA,6,6
63,Brian Thomas Jr.,WR,JAX,12,6
64,Najee Harris,RB,PIT,9,6
65,Xavier Worthy,WR,KC,6,6
66,Tony Pollard,RB,TEN,5,6
67,Zamir White,RB,LV,10,6
68,Anthony Richardson,QB,IND,14,6
69,Christian Kirk,WR,JAX,12,6
70,Jayden Daniels,QB,WAS,14,6
71,Jonathon Brooks,RB,CAR,11,7
72,Jaxon Smith-Njigba,WR,SEA,10,7
73,Brian Robinson Jr.,RB,WAS,14,7
74,Austin Ekeler,RB,WAS,14,7
75,Javonte Williams,RB,DEN,14,7
76,Hollywood Brown,WR,KC,6,7
77,Ladd McConkey,WR,LAC,5,7
78,Jaylen Warren,RB,PIT,9,7
79,Gabe Davis,WR,JAX,12,7
80,Brock Bowers,TE,LV,10,7
81,Jake Ferguson,TE,DAL,7,7
82,Devin Singletary,RB,NYG,11,7
83,Jordan Addison,WR,MIN,6,7
84,Kyler Murray,QB,ARI,11,7
85,Chase Brown,RB,CIN,12,7
86,Jerome Ford,RB,CLE,10,7
87,David Njoku,TE,CLE,10,7
88,Dallas Goedert,TE,PHI,5,7
89,Dak Prescott,QB,DAL,7,7
90,Rome Odunze,WR,CHI,7,7
91,San Francisco 49ers,DEF,SF,9,8
92,Baltimore Ravens,DEF,BAL,14,8
93,New York Jets,DEF,NYJ,12,8
94,Dallas Cowboys,DEF,DAL,7,8
95,Cleveland Browns,DEF,CLE,10,8
96,Kansas City Chiefs,DEF,KC,6,8
97,Justin Tucker,K,BAL,14,8
98,Brandon Aubrey,K,DAL,7,8
99,Harrison Butker,K,KC,6,8
100,Ka'imi Fairbairn,K,HOU,14,8
101,Chigoziem Okonkwo,TE,TEN,5,8
102,Josh Palmer,WR,LAC,5,8
103,Ray Davis,RB,BUF,12,8
104,Bucky Irving,RB,TB,11,8
105,Rico Dowdle,RB,DAL,7,8
106,Kimani Vidal,RB,LAC,5,8
107,Demarcus Robinson,WR,LAR,6,8
108,Jalen Tolbert,WR,DAL,7,8
109,Wan'Dale Robinson,WR,NYG,11,8
110,Tre Tucker,WR,LV,10,8
111,Taysom Hill,TE,NO,12,8
112,Jordan Love,QB,GB,10,8
113,Brock Purdy,QB,SF,9,8
114,Jared Goff,QB,DET,5,8
115,Tua Tagovailoa,QB,MIA,6,8
116,Baker Mayfield,QB,TB,11,8
117,Caleb Williams,QB,CHI,7,8
118,Tyler Allgeier,RB,ATL,12,8
119,Zach Charbonnet,RB,SEA,10,8
120,Tyjae Spears,RB,TEN,5,8`;

/**
 * Parses and returns the default sample ranking items
 */
export function getSampleRankingItems(): ParsedRankingItem[] {
  const result = parseRankingsCsv(SAMPLE_CSV_CONTENT);
  return result.items;
}

/**
 * Initiates a browser file download of the sample template CSV
 */
export function downloadSampleCsvTemplate(): void {
  const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Fantasy_Rankings_Consensus_Sample.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
