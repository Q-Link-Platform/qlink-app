// Q-Link Global Synthetic Ecosystem Directory
// Enterprise Shadow Bootstrapping Dataset - High-Fidelity Global Profiles
// Zero DB storage, zero DB queries, zero server load.

export interface SyntheticPost {
  id: string;
  text: string;
  audience: string;
  attachmentId: string | null;
  attachmentKind: string | null;
  createdAt: string;
  expiresAt: string;
  _count: {
    reactions: number;
    comments: number;
    views: number;
  };
}

export interface SyntheticDirectoryUser {
  id: string;
  handle: string;
  name: string | null;
  image: string | null;
  rank: number;
  isRedTick: boolean;
  auraPercentage: number;
  blueTickStatus: string;
  points: number;
  posts: SyntheticPost[];
}

export const RAW_SYNTHETIC_PROFILES: Omit<SyntheticDirectoryUser, 'rank'>[] = [
  {
    "id": "synth_usr_001",
    "handle": "lucas_vance",
    "name": "Lucas Vance",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 76,
    "blueTickStatus": "none",
    "points": 420,
    "posts": [
      {
        "id": "synth_post_001",
        "text": "benchmarking quantum key distribution algorithms ⚡",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-11T15:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 34,
          "comments": 9,
          "views": 796
        }
      }
    ]
  },
  {
    "id": "synth_usr_002",
    "handle": "sarah_conner",
    "name": "Sarah C.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 50,
    "posts": []
  },
  {
    "id": "synth_usr_003",
    "handle": "mateo_sol",
    "name": "Mateo Silva ⚡",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 84,
    "blueTickStatus": "SAPPHIRE",
    "points": 1280,
    "posts": [
      {
        "id": "synth_post_003",
        "text": "crypto privacy layer testnet is live on qlink",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-11T05:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 39,
          "comments": 10,
          "views": 2344
        }
      }
    ]
  },
  {
    "id": "synth_usr_004",
    "handle": "camila_dev",
    "name": "Camila Duarte",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 45,
    "blueTickStatus": "none",
    "points": 310,
    "posts": [
      {
        "id": "synth_post_004",
        "text": "buenos aires dev scene is blooming",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-11T00:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 23,
          "comments": 5,
          "views": 598
        }
      }
    ]
  },
  {
    "id": "synth_usr_005",
    "handle": "brandon_sf",
    "name": "Brandon | AI Infra",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 92,
    "blueTickStatus": "SAPPHIRE",
    "points": 2400,
    "posts": [
      {
        "id": "synth_post_005",
        "text": "scaling distributed training across 512 H100s",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-10T19:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 45,
          "comments": 11,
          "views": 4360
        }
      }
    ]
  },
  {
    "id": "synth_usr_006",
    "handle": "diego_valdez",
    "name": "Diego Valdez",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 22,
    "blueTickStatus": "none",
    "points": 110,
    "posts": []
  },
  {
    "id": "synth_usr_007",
    "handle": "ethan_hunt99",
    "name": null,
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 0,
    "posts": []
  },
  {
    "id": "synth_usr_008",
    "handle": "chloe_montreal",
    "name": "Chloe M. 🍁",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 68,
    "blueTickStatus": "none",
    "points": 690,
    "posts": [
      {
        "id": "synth_post_008",
        "text": "love the glassmorphic ui here",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-10T04:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 32,
          "comments": 8,
          "views": 1282
        }
      }
    ]
  },
  {
    "id": "synth_usr_009",
    "handle": "marcus_nyc",
    "name": "Marcus Chen",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 58,
    "blueTickStatus": "none",
    "points": 850,
    "posts": [
      {
        "id": "synth_post_009",
        "text": "high frequency trading engine in zig",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-09T23:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 29,
          "comments": 6,
          "views": 1570
        }
      }
    ]
  },
  {
    "id": "synth_usr_010",
    "handle": "zoe_crypto",
    "name": "Zoe [zero-knowledge]",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 88,
    "blueTickStatus": "none",
    "points": 1920,
    "posts": [
      {
        "id": "synth_post_010",
        "text": "recursive zk-snarks are magic",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-09T18:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 43,
          "comments": 10,
          "views": 3496
        }
      }
    ]
  },
  {
    "id": "synth_usr_011",
    "handle": "austin_rust",
    "name": "austin.rs",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 34,
    "blueTickStatus": "none",
    "points": 190,
    "posts": [
      {
        "id": "synth_post_011",
        "text": "rewriting our entire backend in rust",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-09T13:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 15,
          "comments": 4,
          "views": 382
        }
      }
    ]
  },
  {
    "id": "synth_usr_012",
    "handle": "valentina_r",
    "name": "Valentina Rossi",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 15,
    "blueTickStatus": "none",
    "points": 75,
    "posts": []
  },
  {
    "id": "synth_usr_013",
    "handle": "jake_h",
    "name": null,
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 0,
    "posts": []
  },
  {
    "id": "synth_usr_014",
    "handle": "mason_labs",
    "name": "Mason | Labs",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 62,
    "blueTickStatus": "none",
    "points": 740,
    "posts": [
      {
        "id": "synth_post_014",
        "text": "quantum error correction simulations",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-08T22:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 30,
          "comments": 7,
          "views": 1372
        }
      }
    ]
  },
  {
    "id": "synth_usr_015",
    "handle": "sofia_mendoza",
    "name": "Sofia Mendoza",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 41,
    "blueTickStatus": "none",
    "points": 280,
    "posts": []
  },
  {
    "id": "synth_usr_016",
    "handle": "logan_w",
    "name": "Logan Wright",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 53,
    "blueTickStatus": "none",
    "points": 460,
    "posts": [
      {
        "id": "synth_post_016",
        "text": "e2ee peer channels feel instantaneous",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-08T12:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 23,
          "comments": 6,
          "views": 868
        }
      }
    ]
  },
  {
    "id": "synth_usr_017",
    "handle": "maya_pdx",
    "name": "maya.eth",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 79,
    "blueTickStatus": "none",
    "points": 1150,
    "posts": [
      {
        "id": "synth_post_017",
        "text": "building sovereign digital identities",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-08T07:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 36,
          "comments": 9,
          "views": 2110
        }
      }
    ]
  },
  {
    "id": "synth_usr_018",
    "handle": "gabriel_br",
    "name": "Gabriel Santos",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 29,
    "blueTickStatus": "none",
    "points": 160,
    "posts": []
  },
  {
    "id": "synth_usr_019",
    "handle": "liam_vancouver",
    "name": "Liam V.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 71,
    "blueTickStatus": "none",
    "points": 910,
    "posts": [
      {
        "id": "synth_post_019",
        "text": "snowy mountain coders club",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-07T21:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 34,
          "comments": 8,
          "views": 1678
        }
      }
    ]
  },
  {
    "id": "synth_usr_020",
    "handle": "tyler_dev",
    "name": null,
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 30,
    "posts": []
  },
  {
    "id": "synth_usr_021",
    "handle": "felix_berlin",
    "name": "Felix Wagner 🛠️",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 86,
    "blueTickStatus": "SAPPHIRE",
    "points": 1750,
    "posts": [
      {
        "id": "synth_post_021",
        "text": "berlin weather is cold but the code is hot",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-07T11:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 38,
          "comments": 10,
          "views": 3190
        }
      }
    ]
  },
  {
    "id": "synth_usr_022",
    "handle": "sophie_dubois",
    "name": "Sophie Dubois",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 64,
    "blueTickStatus": "none",
    "points": 820,
    "posts": [
      {
        "id": "synth_post_022",
        "text": "paris tech week discussions were top tier",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-07T06:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 29,
          "comments": 7,
          "views": 1516
        }
      }
    ]
  },
  {
    "id": "synth_usr_023",
    "handle": "astrid_nord",
    "name": "Astrid Lindholm",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 91,
    "blueTickStatus": "SAPPHIRE",
    "points": 2100,
    "posts": [
      {
        "id": "synth_post_023",
        "text": "nordic cybersecurity summit notes dropping soon",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-07T01:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 42,
          "comments": 10,
          "views": 3820
        }
      }
    ]
  },
  {
    "id": "synth_usr_024",
    "handle": "oliver_oxford",
    "name": "Oliver Wright",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 52,
    "blueTickStatus": "none",
    "points": 630,
    "posts": [
      {
        "id": "synth_post_024",
        "text": "post-quantum lattice cryptography paper submitted",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-06T20:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 26,
          "comments": 6,
          "views": 1174
        }
      }
    ]
  },
  {
    "id": "synth_usr_025",
    "handle": "elena_rostova",
    "name": "Elena Rostova | ML",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 95,
    "blueTickStatus": "SAPPHIRE",
    "points": 3400,
    "posts": [
      {
        "id": "synth_post_025",
        "text": "zurich ai lab release v2.4 🚀",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-06T15:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 46,
          "comments": 11,
          "views": 6160
        }
      }
    ]
  },
  {
    "id": "synth_usr_026",
    "handle": "nikita_v",
    "name": "Nikita",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 38,
    "blueTickStatus": "none",
    "points": 240,
    "posts": []
  },
  {
    "id": "synth_usr_027",
    "handle": "lukas_prague",
    "name": "Lukas K.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 0,
    "posts": []
  },
  {
    "id": "synth_usr_028",
    "handle": "freja_cph",
    "name": "Freja Nielsen",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 77,
    "blueTickStatus": "none",
    "points": 1340,
    "posts": [
      {
        "id": "synth_post_028",
        "text": "copenhagen cycling to the co-working space",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-06T00:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 36,
          "comments": 9,
          "views": 2452
        }
      }
    ]
  },
  {
    "id": "synth_usr_029",
    "handle": "matteo_milan",
    "name": "Matteo Bianchi",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 49,
    "blueTickStatus": "none",
    "points": 410,
    "posts": [
      {
        "id": "synth_post_029",
        "text": "ui design systems and fluid motion",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-05T19:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 25,
          "comments": 5,
          "views": 778
        }
      }
    ]
  },
  {
    "id": "synth_usr_030",
    "handle": "hugo_lisbon",
    "name": "Hugo Silva 🌊",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 61,
    "blueTickStatus": "none",
    "points": 780,
    "posts": [
      {
        "id": "synth_post_030",
        "text": "sunset coding by the tejo river",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-05T14:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 31,
          "comments": 7,
          "views": 1444
        }
      }
    ]
  },
  {
    "id": "synth_usr_031",
    "handle": "clara_vienna",
    "name": "Clara Weiss",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 33,
    "blueTickStatus": "none",
    "points": 180,
    "posts": []
  },
  {
    "id": "synth_usr_032",
    "handle": "viktor_warsaw",
    "name": "Viktor M.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 59,
    "blueTickStatus": "none",
    "points": 620,
    "posts": [
      {
        "id": "synth_post_032",
        "text": "low-level linux kernel patches approved",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-05T04:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 27,
          "comments": 7,
          "views": 1156
        }
      }
    ]
  },
  {
    "id": "synth_usr_033",
    "handle": "sven_oslo",
    "name": "Sven H.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 44,
    "blueTickStatus": "none",
    "points": 310,
    "posts": []
  },
  {
    "id": "synth_usr_034",
    "handle": "laura_madrid",
    "name": "Laura Gomez",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 27,
    "blueTickStatus": "none",
    "points": 140,
    "posts": []
  },
  {
    "id": "synth_usr_035",
    "handle": "arthur_brussels",
    "name": null,
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 0,
    "posts": []
  },
  {
    "id": "synth_usr_036",
    "handle": "emma_cambridge",
    "name": "Emma C.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 82,
    "blueTickStatus": "none",
    "points": 1540,
    "posts": [
      {
        "id": "synth_post_036",
        "text": "formal verification of smart contracts",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-04T08:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 36,
          "comments": 9,
          "views": 2812
        }
      }
    ]
  },
  {
    "id": "synth_usr_037",
    "handle": "dmitri_k",
    "name": "dmitri",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 73,
    "blueTickStatus": "none",
    "points": 990,
    "posts": [
      {
        "id": "synth_post_037",
        "text": "tallinn e-residency tech is ahead of its time",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-04T03:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 33,
          "comments": 8,
          "views": 1822
        }
      }
    ]
  },
  {
    "id": "synth_usr_038",
    "handle": "isabella_rome",
    "name": "Isabella",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 18,
    "blueTickStatus": "none",
    "points": 90,
    "posts": []
  },
  {
    "id": "synth_usr_039",
    "handle": "florian_munich",
    "name": "Florian B.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 67,
    "blueTickStatus": "none",
    "points": 870,
    "posts": [
      {
        "id": "synth_post_039",
        "text": "autonomous vehicle perception pipeline",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-03T17:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 33,
          "comments": 8,
          "views": 1606
        }
      }
    ]
  },
  {
    "id": "synth_usr_040",
    "handle": "anouk_ams",
    "name": "Anouk van Dijk",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 56,
    "blueTickStatus": "none",
    "points": 520,
    "posts": [
      {
        "id": "synth_post_040",
        "text": "decentralized routing nodes in amsterdam",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-03T12:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 29,
          "comments": 6,
          "views": 976
        }
      }
    ]
  },
  {
    "id": "synth_usr_041",
    "handle": "kenji_tokyo",
    "name": "Kenji ⚡ Shibuya",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 94,
    "blueTickStatus": "SAPPHIRE",
    "points": 2980,
    "posts": [
      {
        "id": "synth_post_041",
        "text": "late night shipping in shibuya 🌙",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-03T07:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 42,
          "comments": 11,
          "views": 5404
        }
      }
    ]
  },
  {
    "id": "synth_usr_042",
    "handle": "minjun_seoul",
    "name": "Minjun Park | 박민준",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 89,
    "blueTickStatus": "SAPPHIRE",
    "points": 2240,
    "posts": [
      {
        "id": "synth_post_042",
        "text": "gangnam tech meetup demo went flawless",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-03T02:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 41,
          "comments": 10,
          "views": 4072
        }
      }
    ]
  },
  {
    "id": "synth_usr_043",
    "handle": "sakura_dev",
    "name": "Sakura (shipping)",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 63,
    "blueTickStatus": "none",
    "points": 790,
    "posts": [
      {
        "id": "synth_post_043",
        "text": "kyoto quiet mornings with coffee and code",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-02T21:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 30,
          "comments": 7,
          "views": 1462
        }
      }
    ]
  },
  {
    "id": "synth_usr_044",
    "handle": "kai_sg",
    "name": "Kai Sheng | Web3",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 87,
    "blueTickStatus": "SAPPHIRE",
    "points": 1890,
    "posts": [
      {
        "id": "synth_post_044",
        "text": "singapore fintech week prep underway",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-02T16:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 42,
          "comments": 10,
          "views": 3442
        }
      }
    ]
  },
  {
    "id": "synth_usr_045",
    "handle": "yuki_labs",
    "name": "Yukihiro T.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 46,
    "blueTickStatus": "none",
    "points": 350,
    "posts": [
      {
        "id": "synth_post_045",
        "text": "embedded systems firmware update",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-02T11:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 24,
          "comments": 5,
          "views": 670
        }
      }
    ]
  },
  {
    "id": "synth_usr_046",
    "handle": "daewon_kr",
    "name": "daewon.kr",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 0,
    "posts": []
  },
  {
    "id": "synth_usr_047",
    "handle": "jiwon_kim",
    "name": "Jiwon Kim",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 72,
    "blueTickStatus": "none",
    "points": 1020,
    "posts": [
      {
        "id": "synth_post_047",
        "text": "busan hackathon winners announce!",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-02T01:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 33,
          "comments": 8,
          "views": 1876
        }
      }
    ]
  },
  {
    "id": "synth_usr_048",
    "handle": "viet_crypto",
    "name": "Nguyen Hoang 🇻🇳",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 55,
    "blueTickStatus": "none",
    "points": 640,
    "posts": [
      {
        "id": "synth_post_048",
        "text": "vietnam developer community is unstoppable",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-01T20:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 26,
          "comments": 6,
          "views": 1192
        }
      }
    ]
  },
  {
    "id": "synth_usr_049",
    "handle": "lin_taipei",
    "name": "Lin Chen-Wei",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 78,
    "blueTickStatus": "none",
    "points": 1410,
    "posts": [
      {
        "id": "synth_post_049",
        "text": "semiconductor compiler optimizations",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-01T15:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 38,
          "comments": 9,
          "views": 2578
        }
      }
    ]
  },
  {
    "id": "synth_usr_050",
    "handle": "somchai_bkk",
    "name": "Somchai P.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 31,
    "blueTickStatus": "none",
    "points": 210,
    "posts": []
  },
  {
    "id": "synth_usr_051",
    "handle": "ryo_nagoya",
    "name": "Ryo",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 0,
    "posts": []
  },
  {
    "id": "synth_usr_052",
    "handle": "hannah_sg",
    "name": "Hannah Tan",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 69,
    "blueTickStatus": "none",
    "points": 930,
    "posts": [
      {
        "id": "synth_post_052",
        "text": "distributed consensus algorithms in go",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-09-01T00:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 32,
          "comments": 8,
          "views": 1714
        }
      }
    ]
  },
  {
    "id": "synth_usr_053",
    "handle": "budi_jakarta",
    "name": "Budi Santoso",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 42,
    "blueTickStatus": "none",
    "points": 290,
    "posts": [
      {
        "id": "synth_post_053",
        "text": "fintech micro-lending engine",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-31T19:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 20,
          "comments": 5,
          "views": 562
        }
      }
    ]
  },
  {
    "id": "synth_usr_054",
    "handle": "sora_craft",
    "name": "Sora 🌌",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 81,
    "blueTickStatus": "none",
    "points": 1620,
    "posts": [
      {
        "id": "synth_post_054",
        "text": "game graphics shader experiments in webgpu",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-31T14:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 39,
          "comments": 9,
          "views": 2956
        }
      }
    ]
  },
  {
    "id": "synth_usr_055",
    "handle": "mei_ling",
    "name": "Mei Ling",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 54,
    "blueTickStatus": "none",
    "points": 580,
    "posts": []
  },
  {
    "id": "synth_usr_056",
    "handle": "thao_danang",
    "name": "Thao My",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 25,
    "blueTickStatus": "none",
    "points": 130,
    "posts": []
  },
  {
    "id": "synth_usr_057",
    "handle": "jun_fukuoka",
    "name": null,
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 0,
    "posts": []
  },
  {
    "id": "synth_usr_058",
    "handle": "ananya_bkk",
    "name": "Ananya",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 36,
    "blueTickStatus": "none",
    "points": 220,
    "posts": []
  },
  {
    "id": "synth_usr_059",
    "handle": "hayato_m",
    "name": "Hayato Maeda",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 65,
    "blueTickStatus": "none",
    "points": 810,
    "posts": [
      {
        "id": "synth_post_059",
        "text": "p2p mesh networking protocol v1",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-30T13:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 32,
          "comments": 7,
          "views": 1498
        }
      }
    ]
  },
  {
    "id": "synth_usr_060",
    "handle": "eunji_s",
    "name": "Eunji",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 48,
    "blueTickStatus": "none",
    "points": 390,
    "posts": [
      {
        "id": "synth_post_060",
        "text": "frontend micro-interactions are art",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-30T08:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 25,
          "comments": 5,
          "views": 742
        }
      }
    ]
  },
  {
    "id": "synth_usr_061",
    "handle": "arjun_dev",
    "name": "Arjun.dev 🚀",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 93,
    "blueTickStatus": "SAPPHIRE",
    "points": 2750,
    "posts": [
      {
        "id": "synth_post_061",
        "text": "bengaluru traffic outside, clean code inside",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-30T03:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 41,
          "comments": 11,
          "views": 4990
        }
      }
    ]
  },
  {
    "id": "synth_usr_062",
    "handle": "tanvi_k",
    "name": "Tanvi Kulkarni",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 66,
    "blueTickStatus": "none",
    "points": 840,
    "posts": [
      {
        "id": "synth_post_062",
        "text": "ai model quantization benchmarks",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-29T22:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 30,
          "comments": 7,
          "views": 1552
        }
      }
    ]
  },
  {
    "id": "synth_usr_063",
    "handle": "rahul_cloud",
    "name": "Rahul Sharma",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 74,
    "blueTickStatus": "none",
    "points": 1120,
    "posts": [
      {
        "id": "synth_post_063",
        "text": "kubernetes multi-region failover tested",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-29T17:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 35,
          "comments": 8,
          "views": 2056
        }
      }
    ]
  },
  {
    "id": "synth_usr_064",
    "handle": "kavya_stealth",
    "name": "Kavya | stealth",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 85,
    "blueTickStatus": "none",
    "points": 1790,
    "posts": [
      {
        "id": "synth_post_064",
        "text": "building something massive in stealth",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-29T12:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 41,
          "comments": 10,
          "views": 3262
        }
      }
    ]
  },
  {
    "id": "synth_usr_065",
    "handle": "rohan_quant",
    "name": "Rohan M.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 57,
    "blueTickStatus": "none",
    "points": 670,
    "posts": [
      {
        "id": "synth_post_065",
        "text": "sub-microsecond execution pipelines",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-29T07:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 29,
          "comments": 6,
          "views": 1246
        }
      }
    ]
  },
  {
    "id": "synth_usr_066",
    "handle": "priya_cyber",
    "name": "Priya Patel",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 39,
    "blueTickStatus": "none",
    "points": 260,
    "posts": [
      {
        "id": "synth_post_066",
        "text": "zero-trust security policies",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-29T02:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 17,
          "comments": 4,
          "views": 508
        }
      }
    ]
  },
  {
    "id": "synth_usr_067",
    "handle": "aditya_delhi",
    "name": "Aditya Roy",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 47,
    "blueTickStatus": "none",
    "points": 380,
    "posts": []
  },
  {
    "id": "synth_usr_068",
    "handle": "zara_lahore",
    "name": "Zara Khan",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 61,
    "blueTickStatus": "none",
    "points": 720,
    "posts": [
      {
        "id": "synth_post_068",
        "text": "mobile architecture patterns 2026",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-28T16:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 29,
          "comments": 7,
          "views": 1336
        }
      }
    ]
  },
  {
    "id": "synth_usr_069",
    "handle": "vikram_singh",
    "name": null,
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 0,
    "posts": []
  },
  {
    "id": "synth_usr_070",
    "handle": "sneha_r",
    "name": "Sneha Reddy",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 70,
    "blueTickStatus": "none",
    "points": 960,
    "posts": [
      {
        "id": "synth_post_070",
        "text": "quantum state teleportation algorithms",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-28T06:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 35,
          "comments": 8,
          "views": 1768
        }
      }
    ]
  },
  {
    "id": "synth_usr_071",
    "handle": "tashkent_coder",
    "name": "Azizbek",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 32,
    "blueTickStatus": "none",
    "points": 190,
    "posts": []
  },
  {
    "id": "synth_usr_072",
    "handle": "aniket_p",
    "name": "aniket_p",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 21,
    "blueTickStatus": "none",
    "points": 100,
    "posts": []
  },
  {
    "id": "synth_usr_073",
    "handle": "meera_iyer",
    "name": "Meera Iyer",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 51,
    "blueTickStatus": "none",
    "points": 490,
    "posts": [
      {
        "id": "synth_post_073",
        "text": "compiler frontends in ocaml",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-27T15:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 24,
          "comments": 6,
          "views": 922
        }
      }
    ]
  },
  {
    "id": "synth_usr_074",
    "handle": "farhan_khi",
    "name": "Farhan",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 43,
    "blueTickStatus": "none",
    "points": 310,
    "posts": []
  },
  {
    "id": "synth_usr_075",
    "handle": "diya_sharma",
    "name": null,
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 0,
    "posts": []
  },
  {
    "id": "synth_usr_076",
    "handle": "almaty_dev",
    "name": "Nurbolat",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 37,
    "blueTickStatus": "none",
    "points": 230,
    "posts": []
  },
  {
    "id": "synth_usr_077",
    "handle": "karan_0x",
    "name": "Karan [Rust]",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 83,
    "blueTickStatus": "none",
    "points": 1580,
    "posts": [
      {
        "id": "synth_post_077",
        "text": "memory safety without garbage collection",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-26T19:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 38,
          "comments": 9,
          "views": 2884
        }
      }
    ]
  },
  {
    "id": "synth_usr_078",
    "handle": "pooja_v",
    "name": "Pooja Verma",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 28,
    "blueTickStatus": "none",
    "points": 150,
    "posts": []
  },
  {
    "id": "synth_usr_079",
    "handle": "ishaan_b",
    "name": null,
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 20,
    "posts": []
  },
  {
    "id": "synth_usr_080",
    "handle": "dev_siddharth",
    "name": "Siddharth N.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 60,
    "blueTickStatus": "none",
    "points": 710,
    "posts": [
      {
        "id": "synth_post_080",
        "text": "react server components deep dive",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-26T04:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 31,
          "comments": 7,
          "views": 1318
        }
      }
    ]
  },
  {
    "id": "synth_usr_081",
    "handle": "tariq_dxb",
    "name": "Tariq Al-Maktoum 🦅",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 96,
    "blueTickStatus": "SAPPHIRE",
    "points": 3800,
    "posts": [
      {
        "id": "synth_post_081",
        "text": "dubai ai hub scaling rapidly",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-25T23:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 43,
          "comments": 11,
          "views": 6880
        }
      }
    ]
  },
  {
    "id": "synth_usr_082",
    "handle": "noor_h",
    "name": "Noor Haddad",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 75,
    "blueTickStatus": "none",
    "points": 1210,
    "posts": [
      {
        "id": "synth_post_082",
        "text": "sovereign cloud infrastructure",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-25T18:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 34,
          "comments": 9,
          "views": 2218
        }
      }
    ]
  },
  {
    "id": "synth_usr_083",
    "handle": "zayd_ai",
    "name": "Zayd [Neural]",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 82,
    "blueTickStatus": "none",
    "points": 1640,
    "posts": [
      {
        "id": "synth_post_083",
        "text": "riyadh robotics lab sprint week",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-25T13:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 38,
          "comments": 9,
          "views": 2992
        }
      }
    ]
  },
  {
    "id": "synth_usr_084",
    "handle": "omar_capital",
    "name": "Omar Farooq",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 68,
    "blueTickStatus": "none",
    "points": 910,
    "posts": [
      {
        "id": "synth_post_084",
        "text": "angel syndicate backing early founders",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-25T08:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 33,
          "comments": 8,
          "views": 1678
        }
      }
    ]
  },
  {
    "id": "synth_usr_085",
    "handle": "layla_cairo",
    "name": "Layla Mansour",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 45,
    "blueTickStatus": "none",
    "points": 340,
    "posts": [
      {
        "id": "synth_post_085",
        "text": "cairo startup scene is buzzing",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-25T03:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 24,
          "comments": 5,
          "views": 652
        }
      }
    ]
  },
  {
    "id": "synth_usr_086",
    "handle": "youssef_casa",
    "name": "Youssef B.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 53,
    "blueTickStatus": "none",
    "points": 520,
    "posts": []
  },
  {
    "id": "synth_usr_087",
    "handle": "kwame_accra",
    "name": "Kwame Mensah ⚡",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 77,
    "blueTickStatus": "none",
    "points": 1310,
    "posts": [
      {
        "id": "synth_post_087",
        "text": "building pan-african fintech rails",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-24T17:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 35,
          "comments": 9,
          "views": 2398
        }
      }
    ]
  },
  {
    "id": "synth_usr_088",
    "handle": "amara_nairobi",
    "name": "Amara Mwangi",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 64,
    "blueTickStatus": "none",
    "points": 800,
    "posts": [
      {
        "id": "synth_post_088",
        "text": "silicon savannah power!",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-24T12:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 30,
          "comments": 7,
          "views": 1480
        }
      }
    ]
  },
  {
    "id": "synth_usr_089",
    "handle": "chidi_lagos",
    "name": "Chidi Okafor | Web3",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 88,
    "blueTickStatus": "SAPPHIRE",
    "points": 2150,
    "posts": [
      {
        "id": "synth_post_089",
        "text": "lagos builders leading global decentralized tech",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-24T07:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 42,
          "comments": 10,
          "views": 3910
        }
      }
    ]
  },
  {
    "id": "synth_usr_090",
    "handle": "fatima_tunis",
    "name": "Fatima Z.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 35,
    "blueTickStatus": "none",
    "points": 210,
    "posts": []
  },
  {
    "id": "synth_usr_091",
    "handle": "hamza_amman",
    "name": "Hamza",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 0,
    "posts": []
  },
  {
    "id": "synth_usr_092",
    "handle": "kofi_tech",
    "name": "Kofi",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 41,
    "blueTickStatus": "none",
    "points": 270,
    "posts": []
  },
  {
    "id": "synth_usr_093",
    "handle": "selam_addis",
    "name": "Selamawit T.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 58,
    "blueTickStatus": "none",
    "points": 630,
    "posts": [
      {
        "id": "synth_post_093",
        "text": "addis ababa university ai lab",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-23T11:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 28,
          "comments": 6,
          "views": 1174
        }
      }
    ]
  },
  {
    "id": "synth_usr_094",
    "handle": "kareem_muscat",
    "name": "Kareem",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 26,
    "blueTickStatus": "none",
    "points": 140,
    "posts": []
  },
  {
    "id": "synth_usr_095",
    "handle": "thandeka_ct",
    "name": "Thandeka Zulu",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 69,
    "blueTickStatus": "none",
    "points": 920,
    "posts": [
      {
        "id": "synth_post_095",
        "text": "cape town tech ecosystem rocks",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-23T01:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 35,
          "comments": 8,
          "views": 1696
        }
      }
    ]
  },
  {
    "id": "synth_usr_096",
    "handle": "liam_syd",
    "name": "Liam O'Connor 🦘",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 80,
    "blueTickStatus": "none",
    "points": 1530,
    "posts": [
      {
        "id": "synth_post_096",
        "text": "sydney harbor sunrise coffee and commits",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-22T20:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 36,
          "comments": 9,
          "views": 2794
        }
      }
    ]
  },
  {
    "id": "synth_usr_097",
    "handle": "chloe_nz",
    "name": "Chloe Watson",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 65,
    "blueTickStatus": "none",
    "points": 820,
    "posts": [
      {
        "id": "synth_post_097",
        "text": "auckland green cloud computing research",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-22T15:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 30,
          "comments": 7,
          "views": 1516
        }
      }
    ]
  },
  {
    "id": "synth_usr_098",
    "handle": "jack_melb",
    "name": "Jack Miller",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 50,
    "blueTickStatus": "none",
    "points": 480,
    "posts": [
      {
        "id": "synth_post_098",
        "text": "melbourne coffee makes code compile faster",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-22T10:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 24,
          "comments": 6,
          "views": 904
        }
      }
    ]
  },
  {
    "id": "synth_usr_099",
    "handle": "mia_brisbane",
    "name": "Mia K.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 33,
    "blueTickStatus": "none",
    "points": 190,
    "posts": []
  },
  {
    "id": "synth_usr_100",
    "handle": "finn_wellington",
    "name": null,
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 0,
    "posts": []
  },
  {
    "id": "synth_usr_101",
    "handle": "noah_perth",
    "name": "Noah Harrison",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 42,
    "blueTickStatus": "none",
    "points": 290,
    "posts": []
  },
  {
    "id": "synth_usr_102",
    "handle": "frederik_reykjavik",
    "name": "Frederik",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 73,
    "blueTickStatus": "none",
    "points": 1040,
    "posts": [
      {
        "id": "synth_post_102",
        "text": "geothermal powered datacenter node online",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-21T14:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 33,
          "comments": 8,
          "views": 1912
        }
      }
    ]
  },
  {
    "id": "synth_usr_103",
    "handle": "alex_nomad",
    "name": "alex | nomad 🌍",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 84,
    "blueTickStatus": "none",
    "points": 1720,
    "posts": [
      {
        "id": "synth_post_103",
        "text": "working from canguu with 1ms starlink latency",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-21T09:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 39,
          "comments": 10,
          "views": 3136
        }
      }
    ]
  },
  {
    "id": "synth_usr_104",
    "handle": "sam_remote",
    "name": "sam",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 59,
    "blueTickStatus": "none",
    "points": 670,
    "posts": []
  },
  {
    "id": "synth_usr_105",
    "handle": "elena_v",
    "name": "Elena V.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 76,
    "blueTickStatus": "none",
    "points": 1190,
    "posts": [
      {
        "id": "synth_post_105",
        "text": "quantum entanglement data simulations",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-20T23:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 38,
          "comments": 9,
          "views": 2182
        }
      }
    ]
  },
  {
    "id": "synth_usr_106",
    "handle": "nathan_dev",
    "name": null,
    "image": null,
    "isRedTick": false,
    "auraPercentage": 0,
    "blueTickStatus": "none",
    "points": 0,
    "posts": []
  },
  {
    "id": "synth_usr_107",
    "handle": "kai_hawaii",
    "name": "Kai Kalani 🌺",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 67,
    "blueTickStatus": "none",
    "points": 860,
    "posts": [
      {
        "id": "synth_post_107",
        "text": "island vibe coding sessions",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-20T13:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 31,
          "comments": 8,
          "views": 1588
        }
      }
    ]
  },
  {
    "id": "synth_usr_108",
    "handle": "maya_nomad",
    "name": "Maya [Async]",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 90,
    "blueTickStatus": "SAPPHIRE",
    "points": 2300,
    "posts": [
      {
        "id": "synth_post_108",
        "text": "shipping async across 4 timezones",
        "audience": "GLOBAL",
        "attachmentId": null,
        "attachmentKind": null,
        "createdAt": "2026-08-20T08:50:08.000Z",
        "expiresAt": "2027-09-11T16:20:08.000Z",
        "_count": {
          "reactions": 42,
          "comments": 10,
          "views": 4180
        }
      }
    ]
  },
  {
    "id": "synth_usr_109",
    "handle": "oscar_helsinki",
    "name": "Oscar R.",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 48,
    "blueTickStatus": "none",
    "points": 370,
    "posts": []
  },
  {
    "id": "synth_usr_110",
    "handle": "toby_london",
    "name": "Toby",
    "image": null,
    "isRedTick": false,
    "auraPercentage": 23,
    "blueTickStatus": "none",
    "points": 120,
    "posts": []
  }
];

// Fast in-memory handle & ID lookup maps
const syntheticUserByHandle = new Map<string, Omit<SyntheticDirectoryUser, 'rank'>>();
const syntheticUserById = new Map<string, Omit<SyntheticDirectoryUser, 'rank'>>();

RAW_SYNTHETIC_PROFILES.forEach((u) => {
  syntheticUserByHandle.set(u.handle.toLowerCase(), u);
  syntheticUserById.set(u.id, u);
});

/**
 * Returns synthetic profiles with calculated ranks starting from startRank
 */
export function getSyntheticDirectoryItems(startRank: number): SyntheticDirectoryUser[] {
  return RAW_SYNTHETIC_PROFILES.map((profile, idx) => ({
    ...profile,
    rank: startRank + idx,
  }));
}

/**
 * High-speed lookup for friend search or request targeting
 */
export function findSyntheticUser(identifier: string): {
  id: string;
  handle: string;
  name: string | null;
  email: string;
  image: string | null;
  blue_tick_status: string;
  createdAt: string;
} | null {
  if (!identifier || typeof identifier !== 'string') return null;
  const clean = identifier.trim().replace(/^@+/, '').toLowerCase();
  
  const found = syntheticUserByHandle.get(clean) || syntheticUserById.get(clean);
  if (found) {
    return {
      id: found.id,
      handle: found.handle,
      name: found.name,
      email: `${found.handle}@qlink.network`,
      image: found.image,
      blue_tick_status: found.blueTickStatus,
      createdAt: '2026-08-15T08:00:00.000Z',
    };
  }

  // Fallback match on display name if searched
  for (const user of RAW_SYNTHETIC_PROFILES) {
    if (user.name && user.name.toLowerCase().includes(clean)) {
      return {
        id: user.id,
        handle: user.handle,
        name: user.name,
        email: `${user.handle}@qlink.network`,
        image: user.image,
        blue_tick_status: user.blueTickStatus,
        createdAt: '2026-08-15T08:00:00.000Z',
      };
    }
  }

  return null;
}
