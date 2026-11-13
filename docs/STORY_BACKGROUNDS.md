# 1~5장 스토리 전용 배경

2026-11-14. built-in image_gen으로 새 배경 16장을 생성했다. 원본은 수정하지 않고 프로젝트에 복사했다. 프롬프트 전체는 `assets/world/story-v1/prompts.json`에 저장했다. 기존에 생성한 연구소·음식점·창고·폐허는 해당 장소에 유지한다.

대사·보상·클리어 기록은 변경하지 않는다. 6~7장 장면의 배경 키와 기존 렌더링은 유지한다. 재도전과 지난 이야기에서도 같은 장소 배경을 사용한다. 전체 배경을 미리 디코딩하지 않고 현재 장면의 이미지 한 장만 표시한다.

| 배경 키 | 파일 |
|---|---|
| pallet-town | assets/world/story-v1/pallet-town-v1.png |
| road | assets/world/story-v1/forest-path-v1.png |
| forest | assets/world/story-v1/forest-path-v1.png |
| coast | assets/world/story-v1/cerulean-coast-v1.png |
| cerulean-pier | assets/world/story-v1/cerulean-pier-v1.png |
| ferry-deck | assets/world/story-v1/ferry-deck-v1.png |
| vermilion-port | assets/world/story-v1/vermilion-port-v1.png |
| celadon-arrival | assets/world/story-v1/celadon-arrival-v1.png |
| blossom-street | assets/world/story-v1/blossom-street-v1.png |
| rocket-hideout | assets/world/story-v1/rocket-hideout-v1.png |
| safari-fog | assets/world/story-v1/safari-mist-v1.png |
| shop | assets/world/story-v1/scout-reception-v1.png |
| gym-rock | assets/world/story-v1/gym-rock-v1.png |
| gym-water | assets/world/story-v1/gym-water-v1.png |
| gym-electric | assets/world/story-v1/gym-electric-v1.png |
| gym-grass | assets/world/story-v1/gym-grass-v1.png |
| gym-poison | assets/world/story-v1/gym-poison-v1.png |
| lab | assets/world/oak-laboratory-v2.png |
| restaurant | assets/world/flower-restaurant-v1.png |
| warehouse | assets/world/port-warehouse-v1.png |
| warehouse-dark | assets/world/port-warehouse-v1.png |
| ruined-city | assets/world/fuchsia-ruins-v1.png |

3장 출항은 선착장 → 배 갑판 → 갈색시티 항구로 전환한다. 창고 소등/점등은 같은 그림을 공유해 구조가 바뀌지 않는다. 4장 음식점과 로켓단 거점은 별도 그림이다. 5장 폐허와 사파리 외곽도 구분한다.
