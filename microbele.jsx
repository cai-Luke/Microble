import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════
// RESTRUCTURED ORGANISM DATABASE — 101 ORGANISMS
// Hint pacing: Gram → Broad Morphology → O₂ → Screening Tests → Clinical Clue → Definitive ID
// Screening = broad tests only (catalase, oxidase, hemolysis, lactose, motility)
// Definitive = specific media + pathognomonic test + board exam trivia
// ═══════════════════════════════════════════════════════════════════
const ORGANISMS = [
  {id:1,name:"Staphylococcus aureus",g:"Positive",m:"Cocci",o:"Facultative anaerobe",
   s:"Catalase positive · Beta-hemolytic · Ferments mannitol",
   c:"Skin and soft tissue infections, bacteremia, endocarditis, osteomyelitis, toxic shock syndrome, food poisoning",
   d:"COAGULASE POSITIVE; golden-yellow colonies; mannitol salt agar fermenter (yellow halo); DNase positive"},
  {id:2,name:"Staphylococcus epidermidis",g:"Positive",m:"Cocci",o:"Facultative anaerobe",
   s:"Catalase positive · Non-hemolytic · Does not ferment mannitol",
   c:"Prosthetic device infections, catheter-related bloodstream infections, biofilm producer",
   d:"Coagulase negative + novobiocin SUSCEPTIBLE; white non-hemolytic colonies; most common CoNS species"},
  {id:3,name:"Staphylococcus saprophyticus",g:"Positive",m:"Cocci",o:"Facultative anaerobe",
   s:"Catalase positive · Non-hemolytic · Does not ferment mannitol",
   c:"Urinary tract infections in young sexually active women (second most common cause after E. coli)",
   d:"Coagulase negative + novobiocin RESISTANT; key differentiator from S. epidermidis"},
  {id:4,name:"Staphylococcus lugdunensis",g:"Positive",m:"Cocci",o:"Facultative anaerobe",
   s:"Catalase positive · May be beta-hemolytic · PYR positive (unusual for staphylococci)",
   c:"Aggressive native valve endocarditis mimicking S. aureus virulence despite being CoNS",
   d:"Coagulase negative (tube) but ORNITHINE DECARBOXYLASE positive and PYR positive; mimics S. aureus clinically"},
  {id:5,name:"Streptococcus pyogenes",g:"Positive",m:"Cocci in chains",o:"Facultative anaerobe",
   s:"Catalase negative · Large-zone beta-hemolytic · PYR positive",
   c:"Pharyngitis, scarlet fever, necrotizing fasciitis, rheumatic fever, post-streptococcal glomerulonephritis",
   d:"Lancefield GROUP A; BACITRACIN SUSCEPTIBLE; large beta-hemolysis on sheep blood agar"},
  {id:6,name:"Streptococcus agalactiae",g:"Positive",m:"Cocci in chains",o:"Facultative anaerobe",
   s:"Catalase negative · Narrow-zone beta-hemolytic · Hippurate hydrolysis positive",
   c:"Neonatal meningitis and early-onset sepsis, maternal chorioamnionitis, UTI in diabetics/elderly",
   d:"Lancefield GROUP B; CAMP TEST positive (arrowhead hemolysis with S. aureus); orange-red pigment on Granada medium"},
  {id:7,name:"Streptococcus pneumoniae",g:"Positive",m:"Diplococci",o:"Facultative anaerobe",
   s:"Catalase negative · Alpha-hemolytic · Requires CO₂ enrichment",
   c:"Community-acquired pneumonia (#1 cause), bacterial meningitis in adults, otitis media, sinusitis",
   d:"OPTOCHIN SUSCEPTIBLE + BILE SOLUBLE; lancet-shaped; draughtsman colonies; Quellung reaction with capsular antisera"},
  {id:8,name:"Enterococcus faecalis",g:"Positive",m:"Cocci in pairs and chains",o:"Facultative anaerobe",
   s:"Catalase negative · Gamma- or alpha-hemolytic · PYR positive",
   c:"UTIs, endocarditis, biliary tract infections, intra-abdominal infections",
   d:"Lancefield group D; grows in 6.5% NaCl AND at 45°C; BILE ESCULIN positive (black); most common Enterococcus"},
  {id:9,name:"Enterococcus faecium",g:"Positive",m:"Cocci in pairs and chains",o:"Facultative anaerobe",
   s:"Catalase negative · PYR positive · Grows in 6.5% NaCl",
   c:"Nosocomial infections, VRE bacteremia, difficult-to-treat endocarditis",
   d:"ARABINOSE positive (distinguishes from E. faecalis); most common species among vancomycin-resistant enterococci (VRE)"},
  {id:10,name:"Streptococcus gallolyticus",g:"Positive",m:"Cocci in chains",o:"Facultative anaerobe",
   s:"Catalase negative · Non- or alpha-hemolytic · Lancefield group D",
   c:"Endocarditis and bacteremia; blood culture isolation warrants colonoscopy",
   d:"Bile esculin positive but does NOT grow in 6.5% NaCl (not Enterococcus); strong association with COLORECTAL CANCER"},
  {id:11,name:"Streptococcus anginosus group",g:"Positive",m:"Cocci in chains",o:"Facultative anaerobe",
   s:"Catalase negative · Variable hemolysis · VP positive",
   c:"Abscess formation (brain, liver, lung, abdominal); empyema; mixed anaerobic infections",
   d:"Small pinpoint colonies with BUTTERSCOTCH/CARAMEL ODOR; variable Lancefield grouping (A, C, F, G, or ungroupable)"},
  {id:12,name:"Streptococcus mutans",g:"Positive",m:"Cocci in chains",o:"Facultative anaerobe",
   s:"Catalase negative · Alpha-hemolytic · Viridans group streptococcus",
   c:"Dental caries (primary etiologic agent); occasional subacute bacterial endocarditis",
   d:"Optochin resistant + bile insoluble; produces GLUCANS from sucrose (adheres to enamel); mitis-salivarius agar with bacitracin; #1 cause of DENTAL CARIES"},
  {id:13,name:"Aerococcus urinae",g:"Positive",m:"Cocci in tetrads",o:"Facultative anaerobe",
   s:"Catalase negative · Alpha-hemolytic · PYR positive",
   c:"Urinary tract infections primarily in elderly men",
   d:"Cocci in TETRADS (not chains); LAP (leucine aminopeptidase) NEGATIVE; resembles viridans strep but clusters differently"},
  {id:14,name:"Leuconostoc species",g:"Positive",m:"Cocci in pairs and chains",o:"Facultative anaerobe",
   s:"Catalase negative · PYR negative · Produces gas from glucose",
   c:"Opportunistic infections in immunocompromised; intrinsic vancomycin resistance",
   d:"Intrinsically VANCOMYCIN RESISTANT gram-positive coccus; heterofermentative (gas from glucose); not Enterococcus (PYR negative)"},
  {id:15,name:"Listeria monocytogenes",g:"Positive",m:"Coccobacilli",o:"Facultative anaerobe",
   s:"Catalase positive · Narrow beta-hemolysis · Motile at room temperature",
   c:"Neonatal meningitis/sepsis, meningitis in elderly/immunosuppressed, foodborne outbreaks (deli meats, soft cheeses, unpasteurized dairy)",
   d:"TUMBLING MOTILITY at 25°C but NOT 37°C; umbrella pattern in semisolid agar; cold enrichment at 4°C; V/L diphtheroid-like forms"},
  {id:16,name:"Corynebacterium diphtheriae",g:"Positive",m:"Pleomorphic rods",o:"Facultative anaerobe",
   s:"Catalase positive · Non-motile · Club-shaped cells",
   c:"Pharyngeal diphtheria (pseudomembrane), cutaneous diphtheria; toxin encoded by beta-prophage",
   d:"CHINESE-LETTER V/L arrangement; METACHROMATIC GRANULES on Loeffler stain; ELEK TEST for toxin; Tinsdale agar (brown-black halo)"},
  {id:17,name:"Corynebacterium jeikeium",g:"Positive",m:"Pleomorphic rods",o:"Aerobe",
   s:"Catalase positive · Lipophilic · Non-hemolytic",
   c:"Line-related bacteremia, wound infections in neutropenic/immunocompromised",
   d:"Lipophilic diphtheroid requiring Tween 80; MULTIDRUG RESISTANT — susceptible ONLY to vancomycin"},
  {id:18,name:"Bacillus anthracis",g:"Positive",m:"Large rods in chains",o:"Facultative anaerobe",
   s:"Catalase positive · Non-hemolytic · Non-motile · Spore-forming",
   c:"Cutaneous anthrax (black eschar), inhalation anthrax (woolsorter's disease), GI anthrax; bioterrorism agent",
   d:"NONMOTILE Bacillus (unique in genus); MEDUSA-HEAD ground-glass colonies; poly-D-glutamic acid capsule on bicarbonate agar + CO₂"},
  {id:19,name:"Bacillus cereus",g:"Positive",m:"Large rods in chains",o:"Facultative anaerobe",
   s:"Catalase positive · Beta-hemolytic · Motile · Spore-forming",
   c:"Two food poisoning syndromes: emetic (reheated fried rice) and diarrheal; post-traumatic endophthalmitis",
   d:"Motile, beta-hemolytic Bacillus (unlike nonmotile B. anthracis); lecithinase positive; REHEATED RICE food poisoning"},
  {id:20,name:"Clostridium perfringens",g:"Positive",m:"Large rods",o:"Obligate anaerobe (aerotolerant)",
   s:"Lecithinase positive · Rarely forms spores in clinical specimens · Rapid growth for an anaerobe",
   c:"Gas gangrene (clostridial myonecrosis), food poisoning (enterotoxin), necrotizing enteritis",
   d:"DOUBLE zone of beta-hemolysis; STORMY FERMENTATION in litmus milk; Nagler reaction positive on egg yolk agar"},
  {id:21,name:"Clostridioides difficile",g:"Positive",m:"Rods",o:"Obligate anaerobe",
   s:"Subterminal spores · L-proline aminopeptidase positive · GDH antigen positive",
   c:"Antibiotic-associated diarrhea, pseudomembranous colitis; nosocomial spore transmission",
   d:"Yellow ground-glass colonies on CCFA; HORSE-BARN ODOR (p-cresol); toxin A/B detection; chartreuse UV fluorescence"},
  {id:22,name:"Clostridium tetani",g:"Positive",m:"Rods",o:"Obligate anaerobe",
   s:"Terminal spores · Indole negative · Lipase negative",
   c:"Spastic paralysis from wound contamination; blocks glycine and GABA at spinal cord",
   d:"DRUMSTICK/TENNIS RACQUET appearance (terminal round spore); tetanospasmin neurotoxin; swarming growth; causes TETANUS"},
  {id:23,name:"Clostridium botulinum",g:"Positive",m:"Rods",o:"Obligate anaerobe",
   s:"Subterminal spores · Lipase positive · Lecithinase positive",
   c:"Descending FLACCID paralysis; foodborne, infant, and wound forms",
   d:"Botulinum neurotoxin (most potent biological toxin); infant form linked to HONEY; diagnosis by toxin in serum/stool/food"},
  {id:24,name:"Erysipelothrix rhusiopathiae",g:"Positive",m:"Rods",o:"Facultative anaerobe",
   s:"Catalase negative · Alpha-hemolytic · Non-motile",
   c:"Erysipeloid — violaceous skin infection in handlers of fish, meat, poultry (occupational disease)",
   d:"H₂S POSITIVE on TSI (differentiates from Listeria); pipe-cleaner growth in gelatin stab; FISH/MEAT HANDLERS"},
  {id:25,name:"Nocardia species",g:"Positive",m:"Filamentous rods",o:"Obligate aerobe",
   s:"Catalase positive · Urease positive · Branching beaded filaments",
   c:"Pulmonary nocardiosis in immunocompromised; dissemination to brain abscess; mycetoma",
   d:"PARTIALLY ACID-FAST (modified Kinyoun); chalky white/orange colonies; aerial hyphae; grows on LJ media"},
  {id:26,name:"Actinomyces israelii",g:"Positive",m:"Filamentous rods",o:"Anaerobe",
   s:"Catalase negative · NOT acid-fast (unlike Nocardia) · Indole negative",
   c:"Cervicofacial actinomycosis (lumpy jaw), thoracic/abdominal actinomycosis; associated with IUD use",
   d:"SULFUR GRANULES in tissue/pus; MOLAR TOOTH colonies after 5–7 days anaerobic incubation; lumpy jaw"},
  {id:27,name:"Rhodococcus equi",g:"Positive",m:"Coccobacilli",o:"Obligate aerobe",
   s:"Catalase positive · Partially acid-fast · Rod-coccus cycle",
   c:"Cavitary pneumonia in HIV/AIDS patients; associated with horse and soil exposure",
   d:"SALMON-PINK mucoid colonies; equi factor positive (CAMP-like with Listeria); horse/soil exposure + AIDS"},
  {id:28,name:"Arcanobacterium haemolyticum",g:"Positive",m:"Pleomorphic rods",o:"Facultative anaerobe",
   s:"Catalase negative · Beta-hemolytic · Reverse CAMP positive",
   c:"Pharyngitis with scarlatiniform rash in adolescents/young adults — mimics Group A strep",
   d:"Better hemolysis on HUMAN blood agar than sheep; TEENAGER PHARYNGITIS WITH RASH; diphtheroid morphology"},
  {id:29,name:"Gardnerella vaginalis",g:"Variable",m:"Coccobacilli",o:"Facultative anaerobe",
   s:"Catalase negative · Oxidase negative · Hippurate hydrolysis positive",
   c:"Bacterial vaginosis (with anaerobes); fishy amine odor with KOH (whiff test)",
   d:"CLUE CELLS on wet prep (epithelial cells studded with bacteria); HBT agar with diffuse beta-hemolysis on human blood only"},
  {id:30,name:"Cutibacterium acnes",g:"Positive",m:"Pleomorphic rods",o:"Anaerobe (aerotolerant)",
   s:"Catalase positive · Indole positive · Lipase positive",
   c:"Acne vulgaris; prosthetic joint infections (especially shoulder); frequent blood culture contaminant",
   d:"Formerly PROPIONIBACTERIUM ACNES; slow-growing (5–14 days) anaerobic diphtheroid; prosthetic SHOULDER joint infections"},
  {id:31,name:"Neisseria gonorrhoeae",g:"Negative",m:"Diplococci",o:"Aerobe (requires CO₂)",
   s:"Oxidase positive · Superoxol strongly positive · No growth at 22°C",
   c:"Gonorrhea (urethritis, cervicitis, PID), ophthalmia neonatorum, disseminated gonococcal infection",
   d:"Grows on THAYER-MARTIN (MTM) but NOT sheep blood agar; CTA glucose positive ONLY (not maltose); causes GONORRHEA"},
  {id:32,name:"Neisseria meningitidis",g:"Negative",m:"Diplococci",o:"Aerobe (requires CO₂)",
   s:"Oxidase positive · Grows on blood agar AND chocolate agar · Mucoid (encapsulated)",
   c:"Bacterial meningitis (adolescents, outbreaks), meningococcemia with petechiae, Waterhouse-Friderichsen syndrome",
   d:"CTA glucose AND maltose positive; polysaccharide capsule; PURPURA FULMINANS; meningococcemia"},
  {id:33,name:"Moraxella catarrhalis",g:"Negative",m:"Diplococci",o:"Aerobe",
   s:"Oxidase positive · DNase positive · Non-hemolytic",
   c:"Otitis media, sinusitis, COPD exacerbation; third most common cause of otitis media",
   d:"HOCKEY-PUCK colonies (slide intact across agar); BUTYRATE ESTERASE (tributyrin) test positive; most strains produce beta-lactamase"},
  {id:34,name:"Escherichia coli",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Lactose fermenter · Indole positive · Oxidase negative",
   c:"#1 cause of UTIs, neonatal meningitis (K1 capsule), traveler's diarrhea (ETEC), HUS (STEC O157:H7)",
   d:"GREEN METALLIC SHEEN on EMB agar; IMViC ++−−; pink colonies on MacConkey; O157:H7 sorbitol negative on SMAC"},
  {id:35,name:"Klebsiella pneumoniae",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Lactose fermenter · Indole negative · Non-motile",
   c:"Nosocomial pneumonia (currant-jelly sputum), UTIs, liver abscess (hypervirulent), KPC carbapenem resistance",
   d:"MUCOID encapsulated colonies; STRING TEST positive (hypervirulent K1/K2); urease positive; thick polysaccharide capsule"},
  {id:36,name:"Klebsiella oxytoca",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Lactose fermenter · Indole POSITIVE (unlike K. pneumoniae) · Urease positive",
   c:"Antibiotic-associated hemorrhagic colitis; nosocomial infections",
   d:"Indole-positive Klebsiella; HEMORRHAGIC COLITIS association; mucoid colonies like K. pneumoniae"},
  {id:37,name:"Proteus mirabilis",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Lactose non-fermenter · Urease positive (strongly) · H₂S positive",
   c:"UTIs with alkaline urine and struvite (staghorn) kidney stones; wound infections",
   d:"SWARMING motility on blood agar (concentric waves); indole NEGATIVE; PDA positive; STRUVITE STONES"},
  {id:38,name:"Proteus vulgaris",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Lactose non-fermenter · Urease positive · H₂S positive · Swarming",
   c:"UTIs, wound infections; historical serologic cross-reaction with Rickettsia",
   d:"Indole POSITIVE (unlike P. mirabilis); WEIL-FELIX OX-19 and OX-2 antigens cross-react with Rickettsia"},
  {id:39,name:"Serratia marcescens",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Late/non-lactose-fermenter · DNase positive · Gelatinase positive",
   c:"Nosocomial infections (respiratory, urinary), osteomyelitis in IV drug users",
   d:"RED-PIGMENTED colonies (PRODIGIOSIN) at 25°C; lipase positive; intrinsically COLISTIN RESISTANT"},
  {id:40,name:"Enterobacter cloacae complex",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Lactose fermenter · VP positive · Motile",
   c:"Nosocomial infections; may develop resistance DURING cephalosporin therapy",
   d:"SPICE organism with INDUCIBLE AmpC beta-lactamase; resistance emerges on 3rd-gen cephalosporins via derepression"},
  {id:41,name:"Citrobacter freundii",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Variable lactose fermentation · H₂S positive · Citrate positive",
   c:"Nosocomial UTIs, respiratory infections, neonatal meningitis",
   d:"H₂S-positive, citrate-positive SPICE organism (inducible AmpC); can RESEMBLE SALMONELLA biochemically; indole negative"},
  {id:42,name:"Citrobacter koseri",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Indole positive · H₂S NEGATIVE (unlike C. freundii) · Citrate positive",
   c:"Neonatal meningitis with brain abscess formation — characteristic neonatal association",
   d:"Indole-positive, H₂S-negative Citrobacter; NEONATAL BRAIN ABSCESSES (classic board association)"},
  {id:43,name:"Morganella morganii",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Lactose non-fermenter · Urease positive · Indole positive",
   c:"UTIs, wound infections, nosocomial bacteremia; Proteeae tribe member",
   d:"Does NOT SWARM (unlike Proteus); PDA positive; ORNITHINE DECARBOXYLASE positive differentiates from Providencia"},
  {id:44,name:"Providencia stuartii",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Lactose non-fermenter · Indole positive · PDA positive",
   c:"Catheter-associated UTIs in long-term care facilities; frequently multidrug resistant",
   d:"UREASE POSITIVE (unique among Providencia); catheter-associated UTI in CHRONIC CARE settings"},
  {id:45,name:"Salmonella enterica (non-typhoidal)",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Lactose non-fermenter · H₂S positive · Motile (peritrichous)",
   c:"Gastroenteritis (poultry, eggs, reptiles), bacteremia, osteomyelitis in sickle cell disease",
   d:"BLACK-CENTERED colonies on HE and XLD agar (H₂S); lysine decarboxylase positive; SICKLE CELL osteomyelitis"},
  {id:46,name:"Salmonella enterica ser. Typhi",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Lactose non-fermenter · Weakly H₂S positive · Motile",
   c:"Typhoid/enteric fever — sustained bacteremia, rose spots, hepatosplenomegaly; human-restricted pathogen",
   d:"CITRATE NEGATIVE (unlike most Salmonella); Vi capsular antigen; chronic GALLBLADDER CARRIER state; typhoid fever"},
  {id:47,name:"Shigella species",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Lactose non-fermenter · H₂S NEGATIVE · Non-motile",
   c:"Bacillary dysentery (bloody diarrhea with mucus); extremely low infectious dose (~10 organisms)",
   d:"NON-MOTILE (key vs Salmonella); lysine decarboxylase negative; Shiga toxin (S. dysenteriae 1) → HUS; ~10 organism infectious dose"},
  {id:48,name:"Yersinia enterocolitica",g:"Negative",m:"Coccobacilli",o:"Facultative anaerobe",
   s:"Urease positive · Oxidase negative · Motile at 25°C but not 37°C",
   c:"Mesenteric lymphadenitis mimicking appendicitis (pseudoappendicitis) in children; associated with pork",
   d:"BULL'S-EYE colonies on CIN agar; cold enrichment at 4°C; TRANSFUSION-ASSOCIATED SEPSIS (grows at 4°C)"},
  {id:49,name:"Yersinia pestis",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Urease NEGATIVE (unlike Y. enterocolitica) · Nonmotile at ALL temperatures · Catalase positive",
   c:"Plague — bubonic (inguinal bubo), septicemic, pneumonic; flea vector from rodents; bioterrorism agent",
   d:"SAFETY-PIN bipolar staining; fried-egg colonies at 28°C; BSL-3 select agent; BUBONIC PLAGUE"},
  {id:50,name:"Cronobacter sakazakii",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Yellow-pigmented · Oxidase negative · Alpha-glucosidase positive",
   c:"Neonatal meningitis and necrotizing enterocolitis from contaminated powdered infant formula",
   d:"Formerly Enterobacter sakazakii; POWDERED INFANT FORMULA contamination; blue-green on chromogenic agars"},
  {id:51,name:"Edwardsiella tarda",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"H₂S positive · Indole positive · Lysine decarboxylase positive",
   c:"Gastroenteritis and wound infections from freshwater/marine exposure",
   d:"H₂S + indole positive Enterobacterales; FRESHWATER FISH (catfish) exposure; wound infections and diarrhea"},
  {id:52,name:"Hafnia alvei",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Lactose non-fermenter · Lysine decarboxylase positive · VP temperature-dependent",
   c:"Rare opportunistic pathogen; important because frequently misidentified as Salmonella",
   d:"VP positive at 22°C but NEGATIVE at 37°C; MISIDENTIFIED AS SALMONELLA; temperature-dependent VP reaction"},
  {id:53,name:"Plesiomonas shigelloides",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Oxidase POSITIVE (very unusual for this order) · Lysine decarboxylase positive · Arginine dihydrolase positive",
   c:"Gastroenteritis from contaminated water, raw shellfish, tropical travel",
   d:"The ONLY OXIDASE-POSITIVE member of Enterobacterales; waterborne/shellfish gastroenteritis"},
  {id:54,name:"Pantoea agglomerans",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Yellow-pigmented · VP positive · Indole negative",
   c:"Wound infections from penetrating injuries with plant material; septic arthritis",
   d:"Formerly Enterobacter agglomerans; PLANT THORN INJURIES (roses, cacti); yellow-pigmented Enterobacterales"},
  {id:55,name:"Pseudomonas aeruginosa",g:"Negative",m:"Rods",o:"Obligate aerobe",
   s:"Oxidase positive · Non-fermenter · Motile (polar flagellum)",
   c:"Burn wound infections, VAP, chronic CF lung infection, swimmer's ear, hot tub folliculitis, ecthyma gangrenosum",
   d:"GRAPE/TORTILLA ODOR; blue-green PYOCYANIN pigment + fluorescent pyoverdin; grows at 42°C; mucoid variant in CF"},
  {id:56,name:"Burkholderia cepacia complex",g:"Negative",m:"Rods",o:"Obligate aerobe",
   s:"Oxidase positive (weakly) · Non-fermenter · Resistant to aminoglycosides and colistin",
   c:"Pulmonary infections in cystic fibrosis — cepacia syndrome (rapid clinical decline); patient-to-patient transmission",
   d:"Grows on BCSA (B. cepacia selective agar); CEPACIA SYNDROME in CF; strict infection control required"},
  {id:57,name:"Stenotrophomonas maltophilia",g:"Negative",m:"Rods",o:"Obligate aerobe",
   s:"Oxidase NEGATIVE (unusual for non-fermenter) · DNase positive · Lysine decarboxylase positive",
   c:"Nosocomial pneumonia and bacteremia in ventilated/immunocompromised patients",
   d:"Intrinsically CARBAPENEM-RESISTANT (L1/L2 beta-lactamases); treated with TMP-SMX; AMMONIA/BLEACH odor; oxidase-negative non-fermenter"},
  {id:58,name:"Acinetobacter baumannii",g:"Negative",m:"Coccobacilli",o:"Obligate aerobe",
   s:"Oxidase negative · Catalase positive · Non-fermenter",
   c:"MDR nosocomial VAP, battlefield/military wound infections, bacteremia; survives on dry surfaces for weeks",
   d:"Gram-negative coccobacillus often APPEARING GRAM-POSITIVE on smear; grows at 44°C; XDR/PDR; BATTLEFIELD WOUND infections"},
  {id:59,name:"Elizabethkingia meningoseptica",g:"Negative",m:"Rods",o:"Obligate aerobe",
   s:"Oxidase positive · Indole positive · Gelatinase positive",
   c:"Neonatal meningitis in premature NICU infants; nosocomial outbreaks through contaminated water",
   d:"Non-fermenter SUSCEPTIBLE TO VANCOMYCIN (paradoxical for gram-negative); pale yellow; lavender on MacConkey"},
  {id:60,name:"Haemophilus influenzae",g:"Negative",m:"Coccobacilli",o:"Facultative anaerobe",
   s:"Oxidase positive · Catalase positive · Does NOT grow on sheep blood agar",
   c:"Meningitis/epiglottitis in unvaccinated children (type b), otitis media, sinusitis; NTHi causes COPD exacerbations",
   d:"Requires BOTH factor X (hemin) AND factor V (NAD); SATELLITING around S. aureus; tiny dewdrop colonies on chocolate agar"},
  {id:61,name:"Haemophilus ducreyi",g:"Negative",m:"Coccobacilli",o:"Facultative anaerobe",
   s:"Oxidase positive · Requires factor X only (not V) · Very difficult to culture",
   c:"Chancroid — PAINFUL genital ulcer with inguinal lymphadenopathy (bubo); STI",
   d:"'SCHOOL OF FISH' / 'railroad track' Gram stain arrangement; painful chancroid (unlike PAINLESS syphilitic chancre)"},
  {id:62,name:"Bordetella pertussis",g:"Negative",m:"Coccobacilli",o:"Obligate aerobe",
   s:"Oxidase positive · Urease negative (unlike B. parapertussis) · Catalase positive",
   c:"Whooping cough — paroxysmal coughing with inspiratory whoop; marked lymphocytosis in blood",
   d:"MERCURY-DROP colonies on Bordet-Gengou or Regan-Lowe agar; pertussis toxin; WHOOPING COUGH; slow-growing (3–7 days)"},
  {id:63,name:"Brucella species",g:"Negative",m:"Coccobacilli",o:"Aerobe",
   s:"Oxidase positive · Urease positive (rapidly) · Catalase positive",
   c:"Undulant fever, granulomatous hepatitis, sacroiliitis, endocarditis; zoonotic from unpasteurized dairy/livestock",
   d:"BSL-3; high LAB-ACQUIRED INFECTION risk; slow-growing; extended blood culture incubation; UNPASTEURIZED DAIRY"},
  {id:64,name:"Francisella tularensis",g:"Negative",m:"Coccobacilli",o:"Obligate aerobe",
   s:"Oxidase negative · Weakly catalase positive · Does NOT grow on MacConkey or standard blood agar",
   c:"Tularemia — ulceroglandular, pneumonic, oculoglandular; rabbits, ticks, deer flies; bioterrorism agent",
   d:"Requires CYSTEINE for growth (chocolate agar, BCYE); BSL-3; TULAREMIA from RABBIT handling or tick bites"},
  {id:65,name:"Pasteurella multocida",g:"Negative",m:"Coccobacilli",o:"Facultative anaerobe",
   s:"Oxidase positive · Catalase positive · Indole positive",
   c:"Wound infection from animal bites/scratches — rapid-onset cellulitis within 24 hours",
   d:"Does NOT grow on MacConkey; musty/mushroom odor; rapid cellulitis from CAT/DOG BITES; bipolar staining"},
  {id:66,name:"Eikenella corrodens",g:"Negative",m:"Rods",o:"Facultative anaerobe",
   s:"Oxidase positive · Catalase negative · Enhanced growth in CO₂",
   c:"Human bite wound infections, endocarditis, infections in IV drug users who lick needles",
   d:"Colonies PIT/CORRODE the agar; BLEACH-LIKE odor; HACEK group; HUMAN BITE infections"},
  {id:67,name:"Aggregatibacter species",g:"Negative",m:"Coccobacilli",o:"Capnophilic",
   s:"Oxidase variable · Catalase positive · Slow-growing in CO₂",
   c:"HACEK endocarditis; aggressive periodontitis; brain abscess",
   d:"STAR-SHAPED internal colony morphology; adherent colonies on chocolate agar; HACEK group; A. actinomycetemcomitans"},
  {id:68,name:"Cardiobacterium hominis",g:"Negative",m:"Pleomorphic rods",o:"Capnophilic",
   s:"Oxidase positive · Catalase negative · Indole positive",
   c:"HACEK endocarditis; normal upper respiratory flora",
   d:"Pleomorphic rods forming ROSETTE clusters; named for cardiac predilection (Cardiobacterium); HACEK group"},
  {id:69,name:"Kingella kingae",g:"Negative",m:"Coccobacilli",o:"Facultative anaerobe",
   s:"Oxidase positive · Catalase negative · Beta-hemolytic",
   c:"Septic arthritis, osteomyelitis, and endocarditis in YOUNG CHILDREN (6 months–4 years)",
   d:"HACEK group; pits agar; best recovered in BLOOD CULTURE BOTTLES; #1 SKELETAL INFECTIONS in children <2 years"},
  {id:70,name:"Legionella pneumophila",g:"Negative",m:"Rods",o:"Obligate aerobe",
   s:"Catalase positive · Stains poorly on Gram stain · Does NOT grow on blood or chocolate agar",
   c:"Legionnaires' disease (severe atypical pneumonia), Pontiac fever; contaminated water systems; intracellular pathogen",
   d:"Requires BCYE agar (L-CYSTEINE + IRON); URINE ANTIGEN detects serogroup 1; cut-glass colonies; waterborne pneumonia"},
  {id:71,name:"Bartonella henselae",g:"Negative",m:"Curved rods",o:"Aerobe (requires CO₂)",
   s:"Oxidase negative · Catalase negative · Extremely slow-growing (2–6 weeks)",
   c:"Regional lymphadenopathy in immunocompetent; bacillary angiomatosis and peliosis hepatis in HIV/AIDS",
   d:"Warthin-Starry SILVER STAIN; cauliflower-like colonies; best diagnosed by serology; CAT SCRATCH DISEASE"},
  {id:72,name:"Capnocytophaga canimorsus",g:"Negative",m:"Fusiform rods",o:"Capnophilic",
   s:"Oxidase positive · Catalase positive · Gliding motility",
   c:"Fulminant sepsis, DIC, and purpura fulminans after animal bites — especially in asplenic or alcoholic patients",
   d:"Fusiform capnophilic rod; DOG BITES in ASPLENIC or ALCOHOLIC patients → fulminant sepsis; slow-growing (5–7 days)"},
  {id:73,name:"Campylobacter jejuni",g:"Negative",m:"Curved rods",o:"Microaerophilic",
   s:"Oxidase positive · Catalase positive · Hippurate hydrolysis positive",
   c:"#1 cause of bacterial gastroenteritis worldwide; associated with poultry; post-infectious Guillain-Barré syndrome",
   d:"SEAGULL-WING/S-shaped morphology; grows at 42°C; Campy-BAP/CCDA agar; GUILLAIN-BARRÉ after gastroenteritis"},
  {id:74,name:"Helicobacter pylori",g:"Negative",m:"Curved rods",o:"Microaerophilic",
   s:"Urease positive (strongly/rapidly) · Oxidase positive · Catalase positive",
   c:"Chronic gastritis, peptic/duodenal ulcers, gastric adenocarcinoma, gastric MALT lymphoma",
   d:"CLO TEST (rapid urease) on gastric biopsy; grows at 37°C NOT 42°C; PEPTIC ULCERS + GASTRIC CANCER + MALT LYMPHOMA"},
  {id:75,name:"Vibrio cholerae",g:"Negative",m:"Curved rods",o:"Facultative anaerobe",
   s:"Oxidase positive · String test positive · Grows in 1% NaCl but NOT 6%",
   c:"Profuse rice-water diarrhea, massive fluid loss, dehydration; O1 and O139 serogroups; contaminated water",
   d:"YELLOW colonies on TCBS agar (sucrose fermenter); comma-shaped; alkaline peptone water (pH 8.6); CHOLERA TOXIN; RICE-WATER diarrhea"},
  {id:76,name:"Vibrio vulnificus",g:"Negative",m:"Curved rods",o:"Facultative anaerobe",
   s:"Oxidase positive · Lactose POSITIVE (unusual for Vibrio) · Halophilic",
   c:"Fatal septicemia from raw oyster consumption in liver disease/iron overload; hemorrhagic bullous wound infections from warm saltwater",
   d:"GREEN on TCBS (non-sucrose fermenter); lactose-fermenting halophile; RAW OYSTERS + LIVER DISEASE/HEMOCHROMATOSIS → fatal septicemia"},
  {id:77,name:"Vibrio parahaemolyticus",g:"Negative",m:"Curved rods",o:"Facultative anaerobe",
   s:"Oxidase positive · Halophilic · Non-sucrose-fermenter",
   c:"Gastroenteritis from raw/undercooked seafood; most common Vibrio causing seafood diarrhea in the US",
   d:"GREEN on TCBS; KANAGAWA PHENOMENON positive (thermostable direct hemolysin); Wagatsuma agar beta-hemolysis"},
  {id:78,name:"Bacteroides fragilis",g:"Negative",m:"Pleomorphic rods",o:"Obligate anaerobe",
   s:"Catalase positive (unusual for anaerobe) · Indole negative · Bile-resistant",
   c:"Most common anaerobic pathogen; intra-abdominal abscesses, peritonitis, bacteremia; inherently penicillin-resistant",
   d:">1mm black colonies on BBE AGAR; BILE-RESISTANT (grows in 20% bile — unlike other anaerobes); #1 anaerobic pathogen"},
  {id:79,name:"Prevotella melaninogenica",g:"Negative",m:"Rods",o:"Obligate anaerobe",
   s:"Bile-SENSITIVE (unlike Bacteroides) · Pigmented · Lipase variable",
   c:"Oral, pulmonary, genital tract anaerobic infections; aspiration pneumonia; periodontal disease",
   d:"BROWN-BLACK PIGMENTED colonies (melanin) after 5–7 days; BRICK-RED UV fluorescence; bile-sensitive (unlike Bacteroides)"},
  {id:80,name:"Fusobacterium nucleatum",g:"Negative",m:"Fusiform rods",o:"Obligate anaerobe",
   s:"Indole positive · Lipase negative · Catalase negative",
   c:"Periodontal disease, brain abscess, aspiration pneumonia; post-pharyngitis septic complication in young adults",
   d:"Spindle-shaped with pointed ends; LEMIERRE SYNDROME (septic internal jugular vein thrombophlebitis after pharyngitis)"},
  {id:81,name:"Veillonella species",g:"Negative",m:"Cocci",o:"Obligate anaerobe",
   s:"Catalase negative · Nitrate reduction positive · Produces gas from lactate",
   c:"Rare opportunistic infections; normal oral/GI flora; unusual morphology for gram-negatives",
   d:"OBLIGATELY ANAEROBIC gram-negative COCCUS — one of the very few gram-negative cocci that is an obligate anaerobe"},
  {id:82,name:"Finegoldia magna",g:"Positive",m:"Cocci in chains and pairs",o:"Obligate anaerobe",
   s:"Catalase negative · Indole negative · SPS susceptible",
   c:"Soft tissue, bone/joint, prosthetic device infections",
   d:"Formerly PEPTOSTREPTOCOCCUS MAGNUS; most clinically significant ANAEROBIC gram-positive coccus"},
  {id:83,name:"Mycobacterium tuberculosis",g:"Acid-fast",m:"Rods",o:"Obligate aerobe",
   s:"Slow-growing (2–6 weeks) · Grows on LJ and Middlebrook media · 37°C optimum",
   c:"Pulmonary TB, miliary TB, TB meningitis, Pott disease (spinal TB); airborne; reportable",
   d:"NIACIN POSITIVE + NITRATE POSITIVE; heat-stable catalase (68°C) NEGATIVE; CORDING (serpentine) on smear; buff rough colonies on LJ"},
  {id:84,name:"Mycobacterium avium complex",g:"Acid-fast",m:"Rods",o:"Obligate aerobe",
   s:"Slow-growing · Niacin negative · Nitrate negative · Heat-stable catalase positive",
   c:"Disseminated infection in AIDS (CD4 <50); pulmonary disease in elderly women; hot tub lung",
   d:"Runyon Group III (NONPHOTOCHROMOGEN); LADY WINDERMERE syndrome; disseminated in AIDS with CD4 <50"},
  {id:85,name:"Mycobacterium kansasii",g:"Acid-fast",m:"Rods",o:"Obligate aerobe",
   s:"Slow-growing · Niacin negative · Nitrate POSITIVE (like M. tb)",
   c:"Pulmonary disease mimicking TB (especially in COPD); most clinically significant photochromogen",
   d:"Runyon Group I (PHOTOCHROMOGEN — yellow ONLY with light); CROSS-BANDED rods on AFB smear; TB mimic"},
  {id:86,name:"Mycobacterium marinum",g:"Acid-fast",m:"Rods",o:"Obligate aerobe",
   s:"Slow-growing · Niacin negative · Grows at 30°C (poor/no growth at 37°C)",
   c:"Chronic skin nodules on extremities with sporotrichoid lymphangitic spread",
   d:"Runyon Group I (photochromogen); FISH TANK / SWIMMING POOL GRANULOMA; optimal at 30–32°C (not 37°C)"},
  {id:87,name:"Mycobacterium gordonae",g:"Acid-fast",m:"Rods",o:"Obligate aerobe",
   s:"Slow-growing · Niacin negative · Tween 80 hydrolysis positive",
   c:"Usually nonpathogenic; most common NTM contaminant in clinical labs; rarely causes true disease",
   d:"Runyon Group II (SCOTOCHROMOGEN — pigmented in BOTH light and dark); 'TAP WATER SCOTOCHROMOGEN'"},
  {id:88,name:"Mycobacterium fortuitum",g:"Acid-fast",m:"Rods",o:"Obligate aerobe",
   s:"RAPID grower (<7 days) · Nitrate positive · 3-day arylsulfatase positive",
   c:"Post-surgical wound infections (mammaplasty), catheter infections; contaminated equipment",
   d:"Runyon Group IV; grows on MacConkey agar (without crystal violet); POST-SURGICAL WOUND infections; iron uptake positive"},
  {id:89,name:"Mycobacterium abscessus",g:"Acid-fast",m:"Rods",o:"Obligate aerobe",
   s:"RAPID grower (<7 days) · Nitrate NEGATIVE (unlike M. fortuitum) · Arylsulfatase positive",
   c:"Chronic pulmonary disease in cystic fibrosis; skin/soft tissue infections; most drug-resistant rapid-grower",
   d:"Most DRUG-RESISTANT rapid-growing mycobacterium; smooth and rough variants; chronic CF lung disease; MacConkey growth"},
  {id:90,name:"Mycobacterium chelonae",g:"Acid-fast",m:"Rods",o:"Obligate aerobe",
   s:"RAPID grower · Nitrate negative · Arylsulfatase positive",
   c:"Disseminated cutaneous infections in immunosuppressed (corticosteroid use); catheter/wound infections",
   d:"Does NOT grow at 42°C (key vs M. abscessus which DOES); optimal 28–30°C; disseminated skin lesions with CORTICOSTEROIDS"},
  {id:91,name:"Treponema pallidum",g:"Not visible (spirochete)",m:"Spirochete",o:"Microaerophilic",
   s:"CANNOT be cultured on artificial media · Too thin for Gram stain · Darkfield microscopy",
   c:"Primary syphilis (painless chancre), secondary (rash, condylomata lata), tertiary (gummas, aortitis), congenital, neurosyphilis",
   d:"UNCULTIVABLE spirochete; RPR/VDRL screening confirmed by FTA-ABS/TP-PA; darkfield of chancre; SYPHILIS"},
  {id:92,name:"Borrelia burgdorferi",g:"Negative",m:"Spirochete",o:"Microaerophilic",
   s:"Loosely coiled · Culture on BSK-II medium · Poorly staining (use Giemsa/silver)",
   c:"Arthritis, carditis, Bell palsy, meningitis; Ixodes tick vector; white-footed mouse reservoir",
   d:"ERYTHEMA MIGRANS (bull's-eye rash); BSK-II medium; two-tier serology; IXODES tick; LYME DISEASE"},
  {id:93,name:"Leptospira interrogans",g:"Not visible (spirochete)",m:"Spirochete",o:"Obligate aerobe",
   s:"Hooked ends · Requires long-chain fatty acids · Darkfield visualization",
   c:"Biphasic illness; severe Weil disease (jaundice, renal failure, hemorrhage); animal urine-contaminated water",
   d:"HOOKED-END spirochete; Fletcher/EMJH semisolid media; WEIL DISEASE; RAT URINE-contaminated water; MAT serology"},
  {id:94,name:"Mycoplasma pneumoniae",g:"None (no cell wall)",m:"Pleomorphic",o:"Facultative anaerobe",
   s:"No cell wall → beta-lactam resistant · Requires cholesterol · Glucose fermenter",
   c:"Walking pneumonia (atypical CAP) in young adults; bullous myringitis; erythema multiforme",
   d:"FRIED-EGG colonies on SP4/Hayflick agar (1–3 weeks); COLD AGGLUTININS (IgM anti-I); WALKING PNEUMONIA in young adults"},
  {id:95,name:"Ureaplasma urealyticum",g:"None (no cell wall)",m:"Pleomorphic",o:"Facultative anaerobe",
   s:"No cell wall → beta-lactam resistant · Urease POSITIVE (unlike Mycoplasma) · Does NOT ferment glucose",
   c:"Nongonococcal urethritis, chorioamnionitis, neonatal pneumonia in premature infants",
   d:"Named for UREASE activity; tiny colonies (15–60 μm) on A8 agar — much smaller than Mycoplasma fried-egg colonies"},
  {id:96,name:"Chlamydia trachomatis",g:"None (obligate intracellular)",m:"Obligate intracellular",o:"Not applicable",
   s:"EB (infectious) / RB (replicating) lifecycle · Susceptible to sulfonamides · NAAT for diagnosis",
   c:"#1 bacterial STI in the US, trachoma (leading infectious cause of blindness), LGV, neonatal conjunctivitis/pneumonia",
   d:"GLYCOGEN-POSITIVE inclusions (iodine stain); EB/RB lifecycle; McCoy cell culture; #1 BACTERIAL STI; TRACHOMA; LGV"},
  {id:97,name:"Chlamydophila pneumoniae",g:"None (obligate intracellular)",m:"Obligate intracellular",o:"Not applicable",
   s:"Glycogen-NEGATIVE inclusions (unlike C. trachomatis) · Sulfonamide RESISTANT · Single serovar",
   c:"Atypical CAP, pharyngitis, bronchitis; person-to-person respiratory; NO animal reservoir",
   d:"PEAR-SHAPED elementary body (vs round in C. trachomatis); TWAR agent; glycogen-negative; no animal reservoir"},
  {id:98,name:"Rickettsia rickettsii",g:"Negative",m:"Obligate intracellular",o:"Aerobe (intracellular)",
   s:"Obligate intracellular · Infects vascular endothelial cells · Cannot grow cell-free",
   c:"Fever, headache, petechial rash beginning on wrists/ankles spreading centripetally; tick-borne",
   d:"DERMACENTOR tick; rash WRISTS/ANKLES → CENTER; Weil-Felix OX-19/OX-2; ROCKY MOUNTAIN SPOTTED FEVER"},
  {id:99,name:"Coxiella burnetii",g:"Negative",m:"Obligate intracellular",o:"Aerobe (intracellular)",
   s:"Obligate intracellular · Survives in phagolysosome (pH 4.5) · Endospore-like small cell variant",
   c:"Acute Q fever (pneumonia, hepatitis) and chronic (culture-negative endocarditis); livestock aerosols",
   d:"BSL-3; Phase I (virulent) / Phase II (avirulent) variation; Q FEVER; NOT TICK-BORNE (livestock aerosol); culture-negative endocarditis"},
  {id:100,name:"Ehrlichia chaffeensis",g:"Negative",m:"Obligate intracellular",o:"Not applicable",
   s:"Grows in monocytes/macrophages · PCR preferred · Cannot grow cell-free",
   c:"Fever, leukopenia, thrombocytopenia, elevated transaminases; tick-borne",
   d:"MORULAE (mulberry inclusions) in MONOCYTES on peripheral smear; LONE STAR TICK (Amblyomma americanum); HUMAN MONOCYTIC EHRLICHIOSIS"},
  {id:101,name:"Anaplasma phagocytophilum",g:"Negative",m:"Obligate intracellular",o:"Not applicable",
   s:"Grows in NEUTROPHILS (NOT monocytes) · PCR preferred · Cannot grow cell-free",
   c:"Fever, leukopenia, thrombocytopenia; Ixodes tick — coinfection with Lyme and Babesia possible",
   d:"MORULAE in NEUTROPHILS (not monocytes); IXODES tick; coinfection with Lyme/Babesia; HUMAN GRANULOCYTIC ANAPLASMOSIS"},
];

// ═══════════════════════════════════════════════════════════════════
// CURATED EASY-FIRST ARCHIVE — bench/board staples for first 14 days
// ═══════════════════════════════════════════════════════════════════
const EASY_NAMES = [
  "Staphylococcus aureus","Escherichia coli","Pseudomonas aeruginosa",
  "Streptococcus pyogenes","Clostridioides difficile","Streptococcus pneumoniae",
  "Klebsiella pneumoniae","Campylobacter jejuni","Neisseria gonorrhoeae",
  "Proteus mirabilis","Mycobacterium tuberculosis","Clostridium perfringens",
  "Helicobacter pylori","Salmonella enterica (non-typhoidal)",
];

const ARCHIVE_START = "2026-03-18";
const ds = d => d.toISOString().split("T")[0];
const db = (a,b) => Math.round((new Date(b)-new Date(a))/864e5);

function seededShuffle(arr,seed){
  const a=[...arr];let s=seed;
  for(let i=a.length-1;i>0;i--){s=(s*1103515245+12345)&0x7fffffff;const j=s%(i+1);[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

function getOrg(dateStr){
  const di=db(ARCHIVE_START,dateStr);
  if(di>=0&&di<EASY_NAMES.length) return ORGANISMS.find(o=>o.name===EASY_NAMES[di])||ORGANISMS[0];
  const used=new Set(EASY_NAMES);
  const rest=ORGANISMS.filter(o=>!used.has(o.name));
  const sh=seededShuffle(rest,7919);
  return sh[((di-EASY_NAMES.length)%rest.length+rest.length)%rest.length];
}

function archiveDates(){
  const t=new Date(),ts=ds(t),dates=[],st=new Date(ARCHIVE_START);
  for(let d=new Date(st);ds(d)<=ts;d.setDate(d.getDate()+1)) dates.push(ds(d));
  return dates.reverse();
}

const fs=d=>new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const fl=d=>new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const pn=d=>db(ARCHIVE_START,d)+1;

const HINTS=[
  {key:"g",label:"Gram Stain",icon:"🔬"},
  {key:"m",label:"Morphology",icon:"🧫"},
  {key:"o",label:"O₂ Requirement",icon:"💨"},
  {key:"s",label:"Screening Tests",icon:"⚗️"},
  {key:"c",label:"Clinical Clue",icon:"🏥"},
  {key:"d",label:"Identification",icon:"🎯"},
];

const C={bg:"#0c0e13",sf:"#14171f",sfh:"#1a1e28",bd:"#252a36",
  t1:"#e8eaf0",t2:"#8b92a8",t3:"#555c72",
  v:"#9b6dff",vd:"#6b3fc4",vg:"rgba(155,109,255,0.15)",
  r:"#e8576e",rd:"#b83a4e",
  g2:"#4ade80",gd:"#166534",gg:"rgba(74,222,128,0.15)"};

export default function MicrobeLE(){
  const today=ds(new Date());
  const [view,setView]=useState("game");
  const [gameDate,setGameDate]=useState(today);
  const [hints,setHints]=useState(1);
  const [guesses,setGuesses]=useState([]);
  const [input,setInput]=useState("");
  const [over,setOver]=useState(false);
  const [won,setWon]=useState(false);
  const [showAC,setShowAC]=useState(false);
  const [acI,setAcI]=useState(-1);
  const [anim,setAnim]=useState(null);
  const [done,setDone]=useState({});
  const iRef=useRef(null);

  const org=useMemo(()=>getOrg(gameDate),[gameDate]);

  useEffect(()=>{(async()=>{try{const r=await window.storage.get("mb_done");if(r)setDone(JSON.parse(r.value))}catch{}})()},[]);

  const save=useCallback(async(d,sc,w)=>{
    const u={...done,[d]:{score:sc,won:w}};setDone(u);
    try{await window.storage.set("mb_done",JSON.stringify(u))}catch{}
  },[done]);

  useEffect(()=>{
    const s=done[gameDate];
    if(s){setOver(true);setWon(s.won);setHints(6);setGuesses([]);}
    else{setOver(false);setWon(false);setHints(1);setGuesses([]);setInput("");}
  },[gameDate]);

  const filt=useMemo(()=>{
    if(!input.trim())return[];
    const q=input.toLowerCase();
    return ORGANISMS.filter(o=>o.name.toLowerCase().includes(q)).filter(o=>!guesses.includes(o.name)).slice(0,8);
  },[input,guesses]);

  function doGuess(n){
    const g=n||input.trim();if(!g||over)return;
    const m=ORGANISMS.find(o=>o.name.toLowerCase()===g.toLowerCase());if(!m)return;
    const ng=[...guesses,m.name];setGuesses(ng);setInput("");setShowAC(false);setAcI(-1);
    if(m.name===org.name){setWon(true);setOver(true);setHints(6);save(gameDate,ng.length,true);}
    else if(ng.length>=6){setOver(true);setHints(6);save(gameDate,6,false);}
    else{const h=Math.min(hints+1,6);setAnim(h-1);setTimeout(()=>setAnim(null),600);setHints(h);}
  }

  function skip(){if(over||hints>=6)return;const h=hints+1;setAnim(h-1);setTimeout(()=>setAnim(null),600);setHints(h);}

  function onKey(e){
    if(e.key==="ArrowDown"){e.preventDefault();setAcI(i=>Math.min(i+1,filt.length-1));}
    else if(e.key==="ArrowUp"){e.preventDefault();setAcI(i=>Math.max(i-1,0));}
    else if(e.key==="Enter"){e.preventDefault();if(acI>=0&&filt[acI])doGuess(filt[acI].name);else if(filt.length===1)doGuess(filt[0].name);}
    else if(e.key==="Escape")setShowAC(false);
  }

  function shareText(){
    const s=done[gameDate];if(!s)return"";
    const sc=s.won?s.score:"X";
    const b=HINTS.map((_,i)=>{if(s.won&&i===s.score-1)return"🟩";if(i<(s.won?s.score:6))return"🟥";return"⬛"}).join("");
    return`🦠 MicrobeLE #${pn(gameDate)} ${sc}/6\n${b}`;
  }

  const bs=b=>({...b,transition:"all 0.2s",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"});

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.t1,fontFamily:"'Newsreader','Georgia',serif"}}>
      <div style={{position:"fixed",inset:0,opacity:0.025,pointerEvents:"none",
        backgroundImage:`radial-gradient(${C.v} 1px,transparent 1px)`,backgroundSize:"24px 24px"}}/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes hr{0%{opacity:0;transform:translateY(8px) scale(.98)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes wp{0%,100%{box-shadow:0 0 0 0 ${C.gg}}50%{box-shadow:0 0 30px 10px ${C.gg}}}
        @keyframes fi{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        input::placeholder{color:${C.t3}} ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-thumb{background:${C.bd};border-radius:3px}
      `}</style>

      <header style={{padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",
        borderBottom:`1px solid ${C.bd}`,background:`linear-gradient(180deg,${C.sf} 0%,transparent 100%)`,zIndex:10,position:"relative"}}>
        <button onClick={()=>setView("how")} style={bs({background:"none",border:"none",color:C.t2,fontSize:13,padding:"6px 10px",borderRadius:6})}
          onMouseEnter={e=>{e.target.style.color=C.t1;e.target.style.background=C.sfh}}
          onMouseLeave={e=>{e.target.style.color=C.t2;e.target.style.background="none"}}>?</button>
        <div style={{textAlign:"center",cursor:"pointer"}} onClick={()=>{setGameDate(today);setView("game")}}>
          <h1 style={{fontSize:22,fontWeight:700,background:`linear-gradient(135deg,${C.v},${C.r})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>MicrobeLE</h1>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:C.t3,letterSpacing:2,textTransform:"uppercase",marginTop:2}}>clinical micro daily</div>
        </div>
        <button onClick={()=>setView("archive")} style={bs({background:"none",border:"none",color:C.t2,fontSize:12,padding:"6px 10px",borderRadius:6})}
          onMouseEnter={e=>{e.target.style.color=C.t1;e.target.style.background=C.sfh}}
          onMouseLeave={e=>{e.target.style.color=C.t2;e.target.style.background="none"}}>Archive</button>
      </header>

      {view==="how"&&(
        <div style={{maxWidth:520,margin:"0 auto",padding:"32px 20px",animation:"fi 0.3s ease"}}>
          <h2 style={{fontSize:20,marginBottom:20,color:C.v}}>How to Play</h2>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,lineHeight:1.8,color:C.t2}}>
            <p style={{marginBottom:16}}>Identify the mystery organism in as few hints as possible.</p>
            <p style={{marginBottom:16}}>You start with <strong style={{color:C.t1}}>one broad clue</strong> (Gram stain). Each wrong guess or skip reveals the next hint — from broad screening to definitive identification.</p>
            <div style={{background:C.sf,border:`1px solid ${C.bd}`,borderRadius:8,padding:"12px 16px",marginBottom:16,fontSize:11,lineHeight:2.2}}>
              {HINTS.map((h,i)=><div key={i}><span style={{color:C.v}}>{i+1}.</span> {h.icon} {h.label}{i===5?" — the giveaway":""}</div>)}
            </div>
            <p style={{marginBottom:16}}><span style={{color:C.g2}}>🟩 solved</span>{"  "}<span style={{color:C.r}}>🟥 wrong/skipped</span>{"  "}<span style={{color:C.t3}}>⬛ unused</span></p>
            <p style={{color:C.t3,fontSize:11,marginBottom:24}}>101 organisms aligned to the ASCP SM exam scope.</p>
          </div>
          <button onClick={()=>setView("game")} style={bs({background:C.v,color:"#fff",border:"none",padding:"12px 28px",borderRadius:8,fontSize:13,fontWeight:600})}>Got it</button>
        </div>
      )}

      {view==="archive"&&(
        <div style={{maxWidth:520,margin:"0 auto",padding:"24px 20px",animation:"fi 0.3s ease"}}>
          <h2 style={{fontSize:18,marginBottom:20,color:C.t2,fontFamily:"'JetBrains Mono',monospace",fontWeight:500}}>Puzzle Archive</h2>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {archiveDates().map(d=>{
              const c2=done[d];const isT=d===today;
              return(<button key={d} onClick={()=>{setGameDate(d);setView("game")}} style={bs({
                display:"flex",alignItems:"center",justifyContent:"space-between",
                background:isT?C.vg:C.sf,border:`1px solid ${isT?C.vd:C.bd}`,borderRadius:8,padding:"12px 16px",color:C.t1,fontSize:13})}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.v}
                onMouseLeave={e=>e.currentTarget.style.borderColor=isT?C.vd:C.bd}>
                <span><span style={{color:C.t3,marginRight:12}}>#{pn(d)}</span>{fs(d)}
                  {isT&&<span style={{marginLeft:10,fontSize:10,color:C.v,background:C.vg,padding:"2px 8px",borderRadius:4}}>TODAY</span>}</span>
                <span>{c2?(c2.won?<span style={{color:C.g2}}>{c2.score}/6 ✓</span>:<span style={{color:C.r}}>X/6</span>):<span style={{color:C.t3}}>—</span>}</span>
              </button>);
            })}
          </div>
        </div>
      )}

      {view==="game"&&(
        <div style={{maxWidth:560,margin:"0 auto",padding:"20px 20px 100px",animation:"fi 0.3s ease"}}>
          <div style={{textAlign:"center",marginBottom:24,fontFamily:"'JetBrains Mono',monospace"}}>
            <div style={{fontSize:11,color:C.t3,letterSpacing:1.5,textTransform:"uppercase"}}>Puzzle #{pn(gameDate)}</div>
            <div style={{fontSize:13,color:C.t2,marginTop:4}}>{fl(gameDate)}
              {gameDate!==today&&<button onClick={()=>setGameDate(today)} style={bs({marginLeft:12,background:C.vg,border:`1px solid ${C.vd}`,color:C.v,padding:"2px 10px",borderRadius:4,fontSize:10})}>today →</button>}
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
            {HINTS.map((h,i)=>{
              const rev=i<hints,isN=anim===i,isL=i===5;
              return(<div key={h.key} style={{
                background:rev?C.sf:"transparent",border:`1px solid ${rev?(isL&&over?(won?C.gd:C.rd):C.bd):C.bd}`,
                borderRadius:10,padding:"14px 16px",opacity:rev?1:0.35,transition:"all 0.4s ease",
                animation:isN?"hr 0.5s ease":undefined,
                ...(isL&&rev&&over&&won?{background:C.gg,borderColor:C.gd}:{})}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:rev?8:0}}>
                  <span style={{fontSize:14}}>{h.icon}</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",
                    color:rev?C.v:C.t3}}>{h.label}</span>
                  {!rev&&<span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:C.t3}}>Hint {i+1}</span>}
                </div>
                {rev&&<div style={{lineHeight:1.6,color:isL?C.t1:C.t2,fontWeight:isL?600:400,
                  fontFamily:isL?"'Newsreader',serif":"'JetBrains Mono',monospace",fontSize:isL?"15px":"12.5px"}}>{org[h.key]}</div>}
              </div>);
            })}
          </div>

          {guesses.length>0&&<div style={{marginBottom:16}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:C.t3,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Your guesses</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {guesses.map((gg,i)=><span key={i} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,padding:"4px 12px",borderRadius:6,
                background:gg===org.name?C.gg:`${C.r}15`,border:`1px solid ${gg===org.name?C.gd:C.rd}`,
                color:gg===org.name?C.g2:C.r,fontStyle:"italic"}}>{gg}</span>)}
            </div>
          </div>}

          {over&&<div style={{background:won?C.gg:`${C.r}10`,border:`1px solid ${won?C.gd:C.rd}`,
            borderRadius:12,padding:20,textAlign:"center",marginBottom:20,animation:won?"wp 2s ease 1":"fi 0.5s ease"}}>
            {won?<>
              <div style={{fontSize:24,marginBottom:8}}>🦠</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.g2,fontWeight:600,marginBottom:4}}>Identified!</div>
              <div style={{fontSize:18,fontWeight:700,fontStyle:"italic",marginBottom:4}}>{org.name}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.t2}}>Solved in {done[gameDate]?.score||guesses.length} hint{(done[gameDate]?.score||guesses.length)>1?"s":""}</div>
            </>:<>
              <div style={{fontSize:24,marginBottom:8}}>💀</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.r,fontWeight:600,marginBottom:4}}>Not this time</div>
              <div style={{fontSize:18,fontWeight:700,fontStyle:"italic",marginBottom:4}}>{org.name}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.t2,lineHeight:1.5,maxWidth:400,margin:"8px auto 0"}}>{org.d}</div>
            </>}
            <div style={{marginTop:16,display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={()=>navigator.clipboard.writeText(shareText())} style={bs({background:C.v,color:"#fff",border:"none",padding:"10px 20px",borderRadius:8,fontSize:12,fontWeight:600})}>Share result</button>
              <button onClick={()=>setView("archive")} style={bs({background:"transparent",color:C.t2,border:`1px solid ${C.bd}`,padding:"10px 20px",borderRadius:8,fontSize:12})}>Browse archive</button>
            </div>
          </div>}

          {!over&&<div style={{position:"relative"}}>
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1,position:"relative"}}>
                <input ref={iRef} type="text" value={input}
                  onChange={e=>{setInput(e.target.value);setShowAC(true);setAcI(-1)}}
                  onFocus={()=>setShowAC(true)} onBlur={()=>setTimeout(()=>setShowAC(false),200)}
                  onKeyDown={onKey} placeholder="Type organism name..."
                  style={{width:"100%",padding:"12px 16px",background:C.sf,border:`1px solid ${C.bd}`,borderRadius:10,
                    color:C.t1,fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontStyle:"italic",outline:"none",transition:"border-color 0.2s"}}
                  onFocusCapture={e=>e.target.style.borderColor=C.v}
                  onBlurCapture={e=>e.target.style.borderColor=C.bd}/>
                {showAC&&filt.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:C.sf,
                  border:`1px solid ${C.bd}`,borderRadius:10,marginTop:4,overflow:"hidden",zIndex:100,maxHeight:280,overflowY:"auto",
                  boxShadow:"0 12px 40px rgba(0,0,0,0.5)"}}>
                  {filt.map((o,i)=><div key={o.id} onMouseDown={e=>{e.preventDefault();doGuess(o.name)}}
                    style={{padding:"10px 16px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:"12.5px",fontStyle:"italic",
                      color:i===acI?C.t1:C.t2,background:i===acI?C.sfh:"transparent",
                      borderBottom:i<filt.length-1?`1px solid ${C.bd}`:"none",transition:"all 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background=C.sfh;e.currentTarget.style.color=C.t1}}
                    onMouseLeave={e=>{if(i!==acI){e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.t2}}}
                  >{o.name}</div>)}
                </div>}
              </div>
              <button onClick={skip} disabled={hints>=6} style={bs({background:"transparent",border:`1px solid ${C.bd}`,
                color:hints>=6?C.t3:C.t2,padding:"12px 16px",borderRadius:10,fontSize:11,whiteSpace:"nowrap",
                opacity:hints>=6?0.4:1,cursor:hints>=6?"default":"pointer"})}
                onMouseEnter={e=>{if(hints<6){e.target.style.borderColor=C.v;e.target.style.color=C.t1}}}
                onMouseLeave={e=>{e.target.style.borderColor=C.bd;e.target.style.color=C.t2}}>Skip →</button>
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:C.t3,marginTop:8,textAlign:"center"}}>
              {6-guesses.length} guess{6-guesses.length!==1?"es":""} remaining · Hint {hints} of 6
            </div>
          </div>}

          {over&&<div style={{display:"flex",gap:4,justifyContent:"center",marginTop:16}}>
            {HINTS.map((_,i)=>{const s=done[gameDate],sc=s?.score||guesses.length,w=s?.won??won;
              let cl=C.bd;if(w&&i===sc-1)cl=C.g2;else if(i<(w?sc:6))cl=C.r;
              return<div key={i} style={{width:36,height:8,borderRadius:4,background:cl,opacity:cl===C.bd?0.3:0.8,
                transition:"all 0.3s ease",transitionDelay:`${i*80}ms`}}/>;
            })}
          </div>}
        </div>
      )}
    </div>
  );
}
