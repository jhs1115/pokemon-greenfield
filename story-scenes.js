/* Dialogue stays in-world; contextual controls live in the battle UI. */
(function(root){root.KANTO_STORY={
  "scenes": {
    "opening": {
      "title": "태초마을 연구소",
      "backdrop": "lab",
      "npc": "oak",
      "lines": [
        {
          "speaker": "oak",
          "text": "왔구나. 여행을 떠나고 싶다고 했지?"
        },
        {
          "speaker": "player",
          "text": "네. 포켓몬과 함께 리그에 도전하고 싶어요."
        },
        {
          "speaker": "oak",
          "text": "리그에 가려면 체육관 배지 여덟 개가 필요하단다. 먼저 회색시티로 가 보렴."
        },
        {
          "speaker": "player",
          "text": "그전에 함께할 포켓몬을 골라도 될까요?"
        },
        {
          "speaker": "oak",
          "text": "물론이지. 파이리, 꼬부기, 이상해씨 중에서 골라 보렴.",
          "choice": "starter"
        },
        {
          "speaker": "oak",
          "text": "{partner}로 정했구나. 자, 여행 경비도 챙겨 가렴."
        },
        {
          "speaker": "player",
          "text": "감사합니다. 잘 다녀올게요."
        },
        {
          "speaker": "oak",
          "text": "길에서는 포켓몬의 상태를 잘 살피렴. 첫 배지를 얻으면 마을의 스카우터도 찾아가 보고."
        },
        {
          "speaker": "narrator",
          "text": "{partner}와 함께 마을 밖으로 나섰다.",
          "backdrop": "road"
        }
      ]
    },
    "before-0": {
      "title": "첫 배틀",
      "backdrop": "road",
      "npc": null,
      "lines": [
        {
          "speaker": "narrator",
          "text": "풀숲에서 야생 포켓몬이 나타났다."
        },
        {
          "speaker": "player",
          "text": "{partner}, 먼저 자리를 잡자. 너무 가까이 가지는 말고."
        }
      ]
    },
    "before-3": {
      "title": "숲길에서",
      "backdrop": "road",
      "npc": "brock",
      "lines": [
        {
          "speaker": "brock",
          "text": "앞쪽 길은 비 때문에 미끄러워. 왼쪽으로 돌아가는 게 좋아."
        },
        {
          "speaker": "player",
          "text": "고맙습니다. 회색시티로 가는 길인가요?"
        },
        {
          "speaker": "brock",
          "text": "맞아. 나는 웅이야. 체육관에서 다시 보자."
        }
      ]
    },
    "before-11": {
      "title": "블루시티의 강가",
      "backdrop": "river",
      "npc": "misty",
      "lines": [
        {
          "speaker": "misty",
          "text": "거긴 물이 깊어. 이쪽으로 와."
        },
        {
          "speaker": "player",
          "text": "고마워. 체육관에 가는 중이야."
        },
        {
          "speaker": "misty",
          "text": "그럼 곧 다시 만나겠네. 난 이슬이야. 강을 건너면 바로 블루시티야."
        }
      ]
    },
    "ambush": {
      "title": "로켓단",
      "backdrop": "river",
      "npc": "rocket",
      "lines": [
        {
          "speaker": "narrator",
          "text": "길가에 포켓몬이 든 우리가 놓여 있다."
        },
        {
          "speaker": "rocket",
          "text": "그건 우리 거다. 손대지 마."
        },
        {
          "speaker": "player",
          "text": "포켓몬들이 다쳤잖아요. 풀어 주세요."
        },
        {
          "speaker": "rocket",
          "text": "로켓단 일에 끼어들지 마라!"
        }
      ]
    },
    "before-20": {
      "title": "갈색시티 항구",
      "backdrop": "harbor",
      "npc": "surge",
      "lines": [
        {
          "speaker": "surge",
          "text": "항구 창고는 당분간 접근 금지다. 포켓몬이 사라졌다는 신고가 들어왔어."
        },
        {
          "speaker": "player",
          "text": "강가에서 로켓단을 만났어요. 여기도 그 사람들일까요?"
        },
        {
          "speaker": "surge",
          "text": "확인해 보지. 나는 마티스, 이곳 관장이야. 수상한 걸 보면 알려 다오."
        }
      ]
    },
    "before-22": {
      "title": "창고 앞",
      "backdrop": "harbor",
      "npc": "rocket",
      "lines": [
        {
          "speaker": "player",
          "text": "상자 안에 포켓몬이 있죠? 문을 열어요."
        },
        {
          "speaker": "rocket",
          "text": "또 너냐. 운송을 방해하면 가만두지 않겠다."
        }
      ]
    },
    "before-27": {
      "title": "운송 기록",
      "backdrop": "harbor",
      "npc": "rocket",
      "lines": [
        {
          "speaker": "narrator",
          "text": "상자에 무지개시티로 향하는 운송장이 붙어 있다."
        },
        {
          "speaker": "rocket",
          "text": "그건 내려놔! 연구소에 보내야 하는 물건이다."
        },
        {
          "speaker": "player",
          "text": "포켓몬을 어디로 데려가는 거죠?"
        }
      ]
    },
    "before-31": {
      "title": "무지개시티의 정원",
      "backdrop": "garden",
      "npc": "erika",
      "lines": [
        {
          "speaker": "erika",
          "text": "항구에서 온 짐을 찾으시나요? 검은 옷을 입은 사람들이 오락장으로 가져가더군요."
        },
        {
          "speaker": "player",
          "text": "로켓단을 찾고 있어요. 포켓몬을 빼앗아 가고 있거든요."
        },
        {
          "speaker": "erika",
          "text": "저는 민화입니다. 정원에서 사라진 포켓몬도 있어요. 함께 확인해 보지요."
        }
      ]
    },
    "before-37": {
      "title": "로켓단 거점",
      "backdrop": "hideout",
      "npc": "rocket",
      "lines": [
        {
          "speaker": "narrator",
          "text": "오락장 지하에서 갇힌 포켓몬들을 발견했다."
        },
        {
          "speaker": "rocket",
          "text": "여길 어떻게 찾았지? 보스의 연구를 방해할 셈이냐?"
        },
        {
          "speaker": "player",
          "text": "우리를 열어요. 포켓몬들은 데려갈 거예요."
        }
      ]
    },
    "after-37": {
      "title": "남은 기록",
      "backdrop": "hideout",
      "npc": "erika",
      "lines": [
        {
          "speaker": "erika",
          "text": "갇혀 있던 포켓몬들은 모두 무사해요."
        },
        {
          "speaker": "player",
          "text": "이 기록에 뮤츠라는 이름이 있어요. 통제 장치를 만든다고 적혀 있는데요."
        },
        {
          "speaker": "erika",
          "text": "오박사님께 보내 확인해 볼게요. 다른 거점도 있는 듯해요."
        }
      ]
    },
    "scout": {
      "title": "스카우터",
      "backdrop": "shop",
      "npc": "scout",
      "lines": [
        {
          "speaker": "scout",
          "text": "오박사님께 연락받았어요. 함께 여행할 포켓몬을 찾고 있죠?"
        },
        {
          "speaker": "player",
          "text": "네. 어떤 포켓몬들이 있나요?"
        },
        {
          "speaker": "scout",
          "text": "여기서 만나 보세요. 첫 만남 비용은 박사님이 맡겨 주셨어요."
        }
      ]
    },
    "manage": {
      "title": "출발 준비",
      "backdrop": "lounge",
      "npc": null,
      "lines": [
        {
          "speaker": "player",
          "text": "다음에 나갈 친구들과 도구를 확인하자."
        }
      ]
    },
    "training": {
      "title": "연습장",
      "backdrop": "training",
      "npc": null,
      "lines": [
        {
          "speaker": "player",
          "text": "다음 길에 가기 전에 기술을 정리해 두자."
        }
      ]
    },
    "before-40": {
      "title": "연분홍시티로",
      "backdrop": "river",
      "npc": "koga",
      "lines": [
        {
          "speaker": "koga",
          "text": "사파리에서 포켓몬을 잡아가는 자들이 있다. 순찰 중이지."
        },
        {
          "speaker": "player",
          "text": "로켓단이라면 저도 찾고 있어요."
        },
        {
          "speaker": "koga",
          "text": "흔적을 발견하면 알려 다오. 나는 독수, 연분홍체육관의 관장이다."
        }
      ]
    },
    "before-43": {
      "title": "사파리 외곽",
      "backdrop": "river",
      "npc": "rocket",
      "lines": [
        {
          "speaker": "rocket",
          "text": "잡은 포켓몬은 도시로 보낸다. 상처 내지 말라고 했잖아."
        },
        {
          "speaker": "player",
          "text": "이번에도 연구에 쓰려는 거죠? 여기서 멈춰요."
        }
      ]
    },
    "before-46": {
      "title": "막힌 운송로",
      "backdrop": "river",
      "npc": "rocket",
      "lines": [
        {
          "speaker": "rocket",
          "text": "실프의 장치만 있으면 그 녀석도 잡아둘 수 있다는데… 또 너냐!"
        },
        {
          "speaker": "player",
          "text": "장치는 어디에 있죠?"
        }
      ]
    },
    "after-46": {
      "title": "도시로 이어지는 단서",
      "backdrop": "river",
      "npc": "koga",
      "lines": [
        {
          "speaker": "koga",
          "text": "운송차는 노랑시티로 향했다. 그쪽에도 소식을 전해 두지."
        },
        {
          "speaker": "player",
          "text": "알겠습니다. 먼저 체육관에 도전하고 출발할게요."
        }
      ]
    },
    "before-50": {
      "title": "노랑시티",
      "backdrop": "harbor",
      "npc": "sabrina",
      "lines": [
        {
          "speaker": "sabrina",
          "text": "실프주식회사에 낯선 사람들이 들어갔어. 직원들도 밖으로 나오지 못하고 있어."
        },
        {
          "speaker": "player",
          "text": "로켓단이 장치를 찾고 있어요. 그 건물에 있는 것 같아요."
        },
        {
          "speaker": "sabrina",
          "text": "정문은 내가 지킬게. 안에 있는 사람들을 부탁해."
        }
      ]
    },
    "before-53": {
      "title": "실프주식회사",
      "backdrop": "hideout",
      "npc": "rocket",
      "lines": [
        {
          "speaker": "rocket",
          "text": "통제 장치의 설계도만 챙기면 된다. 서둘러!"
        },
        {
          "speaker": "player",
          "text": "그 장치는 가져갈 수 없어요."
        }
      ]
    },
    "before-57": {
      "title": "중앙 제어실",
      "backdrop": "hideout",
      "npc": "rocket",
      "lines": [
        {
          "speaker": "rocket",
          "text": "설계도는 이미 홍련섬에 보냈다. 네가 여기서 뭘 해도 늦었어."
        },
        {
          "speaker": "player",
          "text": "우선 직원들부터 풀어 주세요."
        }
      ]
    },
    "after-57": {
      "title": "멈춘 장치",
      "backdrop": "harbor",
      "npc": "sabrina",
      "lines": [
        {
          "speaker": "sabrina",
          "text": "직원들은 모두 나왔어. 장치도 멈췄고."
        },
        {
          "speaker": "player",
          "text": "홍련섬으로 보낸 설계도는 남아 있어요."
        },
        {
          "speaker": "sabrina",
          "text": "그곳 연구를 알던 사람이 있어. 강연 관장을 찾아가 봐."
        }
      ]
    },
    "before-60": {
      "title": "홍련섬",
      "backdrop": "river",
      "npc": "blaine",
      "lines": [
        {
          "speaker": "blaine",
          "text": "초련에게 연락받았다. 뮤츠의 기록을 찾고 있다지?"
        },
        {
          "speaker": "player",
          "text": "로켓단이 통제 장치를 만들고 있어요."
        },
        {
          "speaker": "blaine",
          "text": "옛 저택에 연구 일지가 남아 있다. 나도 함께 살펴보마."
        }
      ]
    },
    "before-63": {
      "title": "폐허가 된 저택",
      "backdrop": "hideout",
      "npc": "rocket",
      "lines": [
        {
          "speaker": "rocket",
          "text": "남은 자료는 전부 회수해. 보스가 직접 확인하신다."
        },
        {
          "speaker": "player",
          "text": "비주기가 시킨 일이군요. 그 자료를 보여 주세요."
        }
      ]
    },
    "before-66": {
      "title": "연구실의 문",
      "backdrop": "hideout",
      "npc": "rocket",
      "lines": [
        {
          "speaker": "rocket",
          "text": "그 포켓몬은 우리 힘으로 다룰 수 있어. 보스가 증명하실 거다."
        },
        {
          "speaker": "player",
          "text": "그래서 다른 포켓몬들까지 잡아간 건가요? 여기서 끝내요."
        }
      ]
    },
    "after-66": {
      "title": "연구 일지",
      "backdrop": "hideout",
      "npc": "blaine",
      "lines": [
        {
          "speaker": "blaine",
          "text": "뮤를 바탕으로 새로운 포켓몬을 만들었다는 기록이다. 이름은 뮤츠."
        },
        {
          "speaker": "player",
          "text": "로켓단은 그 힘을 이용하려는 거군요."
        },
        {
          "speaker": "blaine",
          "text": "현재 계획은 비주기만 알겠지. 남은 단서는 상록시티 쪽이다."
        }
      ]
    },
    "after-69": {
      "title": "다음 목적지",
      "backdrop": "river",
      "npc": "blaine",
      "lines": [
        {
          "speaker": "blaine",
          "text": "볼케이노배지다. 이제 배지는 하나 남았구나."
        },
        {
          "speaker": "player",
          "text": "상록시티로 갈게요. 비주기도 찾아야 해요."
        },
        {
          "speaker": "blaine",
          "text": "기록은 오박사에게 보내 두마. 조심해서 가거라."
        }
      ]
    },
    "secret-marsh": {
      "title": "사파리의 분실물",
      "backdrop": "river",
      "npc": "koga",
      "lines": [
        {
          "speaker": "narrator",
          "text": "풀숲 사이에서 작은 가방을 발견했다."
        },
        {
          "speaker": "koga",
          "text": "순찰대 가방이군. 찾아줘서 고맙다. 안의 시몬열매는 가져가도 좋아."
        }
      ]
    },
    "secret-journal": {
      "title": "책장 뒤의 쪽지",
      "backdrop": "hideout",
      "npc": "blaine",
      "lines": [
        {
          "speaker": "narrator",
          "text": "책장 뒤에 연구원이 남긴 쪽지가 끼워져 있다."
        },
        {
          "speaker": "blaine",
          "text": "통제 실험은 실패했다… 뮤츠가 스스로 탈출한 모양이군. 이건 오박사에게 전하마. 옆의 불꽃의돌은 네가 쓰렴."
        }
      ]
    }
  },
  "gymLines": {
    "brock": [
      [
        "brock",
        "숲길에서 만났지. 회색체육관에 온 걸 환영해."
      ],
      [
        "player",
        "배지에 도전하러 왔어요."
      ],
      [
        "brock",
        "좋아. 바위 포켓몬들을 상대할 준비는 됐겠지?"
      ]
    ],
    "misty": [
      [
        "misty",
        "강을 무사히 건너왔네! 이제 정식으로 겨뤄 볼까?"
      ],
      [
        "player",
        "응. 준비됐어."
      ],
      [
        "misty",
        "블루체육관의 이슬이야. 시작하자!"
      ]
    ],
    "surge": [
      [
        "surge",
        "항구 일은 고맙다. 오늘은 도전자로 왔군."
      ],
      [
        "player",
        "네. 전력으로 부탁드려요."
      ],
      [
        "surge",
        "좋다! 갈색체육관의 전격을 보여 주마."
      ]
    ],
    "erika": [
      [
        "erika",
        "포켓몬들을 구해 주셔서 감사해요. 오늘은 배지를 걸고 겨루어요."
      ],
      [
        "player",
        "잘 부탁드립니다."
      ],
      [
        "erika",
        "무지개체육관의 민화, 도전을 받겠습니다."
      ]
    ],
    "koga": [
      [
        "koga",
        "사파리 일은 잘 처리됐어. 이제 네 실력을 보자."
      ],
      [
        "player",
        "독타입에 대비해 왔어요."
      ],
      [
        "koga",
        "그럼 시작하지. 연분홍체육관의 독수다."
      ]
    ],
    "sabrina": [
      [
        "sabrina",
        "도시를 도와줘서 고마워. 이번엔 우리 차례네."
      ],
      [
        "player",
        "배지에 도전할게."
      ],
      [
        "sabrina",
        "노랑체육관의 초련이야. 준비됐어."
      ]
    ],
    "blaine": [
      [
        "blaine",
        "저택에서 수고했다. 출발 전에 배지를 얻어 가야지."
      ],
      [
        "player",
        "네. 준비됐습니다."
      ],
      [
        "blaine",
        "홍련체육관의 강연이다! 뜨거운 승부를 해 보자."
      ]
    ]
  },
  "cast": {
    "oak": {
      "name": "오박사",
      "src": "oak.png"
    },
    "brock": {
      "name": "웅이",
      "src": "leader_brock.png"
    },
    "misty": {
      "name": "이슬이",
      "src": "leader_misty.png"
    },
    "surge": {
      "name": "마티스",
      "src": "leader_lt_surge.png"
    },
    "erika": {
      "name": "민화",
      "src": "leader_erika.png"
    },
    "koga": {
      "name": "독수",
      "src": "leader_koga.png"
    },
    "sabrina": {
      "name": "초련",
      "src": "leader_sabrina.png"
    },
    "blaine": {
      "name": "강연",
      "src": "leader_blaine.png"
    },
    "rocket": {
      "name": "로켓단 조무래기",
      "src": "rocket_grunt_m.png"
    },
    "scout": {
      "name": "스카우터",
      "src": "scout-ranger.png"
    }
  }
};if(typeof module==='object')module.exports=root.KANTO_STORY;})(typeof window==='object'?window:globalThis);
