# 지역 지도 제작 기록

현재 게임은 아래 7개 v3 지도(각 1774×887, 가로세로 2:1)를 사용합니다. 작은 건물과 넓은 이동 경로를 가진 탑다운 픽셀 환경입니다. 서쪽/동쪽으로 이어지는 길을 두어 지역들이 같은 대륙에 있는 느낌을 냅니다.

| 장 | 분위기 | 현재 이미지 | 전체 편집 프롬프트 |
|---|---|---|---|
| 1 | 탁 트인 초록 평원 | [지도](chapter-1-v3.png) | [프롬프트](chapter-1-v3.prompt.txt) |
| 2 | 강과 농지 | [지도](chapter-2-v3.png) | [프롬프트](chapter-2-v3.prompt.txt) |
| 3 | 산업 항구 | [지도](chapter-3-v3.png) | [프롬프트](chapter-3-v3.prompt.txt) |
| 4 | 황금빛 정원 마을 | [지도](chapter-4-v3.png) | [프롬프트](chapter-4-v3.prompt.txt) |
| 5 | 갈대와 흙빛 습지 | [지도](chapter-5-v3.png) | [프롬프트](chapter-5-v3.prompt.txt) |
| 6 | 회색 도심 | [지도](chapter-6-v3.png) | [프롬프트](chapter-6-v3.prompt.txt) |
| 7 | 화산 지대와 해안 | [지도](chapter-7-v3.png) | [프롬프트](chapter-7-v3.prompt.txt) |

제작: 2026-11-08 내장 image_gen. v2는 지도별 신규 생성, v3는 각 v2 원본을 참조한 편집 모드입니다. 포켓몬과 NPC 스프라이트는 생성하지 않았습니다. v2 이미지와 신규 생성 프롬프트, 이전 아틀라스는 버전 기록으로 보관합니다.

`layout.json`은 현재 이미지, 크기, 지역별 UI 색상, 70개 길 위 표지판의 백분율 좌표를 기록합니다. 런타임 매핑은 저장소의 `story-map.js`입니다. `python scripts/check-route-ground.py`는 원본 이미지를 수정하지 않고 표지판 중심 주변 픽셀을 읽어 도로·포장·다리 배치를 확인합니다.
