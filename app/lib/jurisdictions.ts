/**
 * Phase 4 jurisdiction packs. Every deal carries a governing-law pack
 * (default NG). Packs define the NDA template version + governing law
 * clause. Counsel reviews each pack before its market is marketed to —
 * no pack, no marketing (per PRD §9).
 */
export const JURISDICTIONS = {
  NG: {
    label: "Nigeria",
    law: "Laws of the Federal Republic of Nigeria (Lagos State courts)",
    ndaTemplate: "mutual-v1-ng",
    dataLaw: "NDPR 2019",
  },
  GH: {
    label: "Ghana",
    law: "Laws of the Republic of Ghana (Accra courts)",
    ndaTemplate: "mutual-v1-gh",
    dataLaw: "Data Protection Act, 2012 (Act 843)",
  },
  GB: {
    label: "United Kingdom",
    law: "Laws of England and Wales (London courts)",
    ndaTemplate: "mutual-v1-gb",
    dataLaw: "UK GDPR",
  },
  US: {
    label: "United States",
    law: "Laws of the State of Delaware",
    ndaTemplate: "mutual-v1-us",
    dataLaw: "State privacy laws (CCPA/CPRA et al.)",
  },
} as const;
export type JurisdictionCode = keyof typeof JURISDICTIONS;

export function jurisdictionPack(code: string) {
  return JURISDICTIONS[(code as JurisdictionCode)] ?? JURISDICTIONS.NG;
}
