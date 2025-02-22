// ---------------------------- map -------------------------------
const container = document.getElementById("map"); // 지도를 담을 영역의 DOM 레퍼런스
const options = {
  // 지도를 생성할 때 필요한 기본 옵션
  center: new kakao.maps.LatLng(36.450701, 126.570667), // 지도의 중심좌표.
  level: 14, // 지도의 레벨(확대, 축소 정도)
};

const map = new kakao.maps.Map(container, options); // 지도 생성 및 객체 리턴

// -----------------------------------------------------------------------------------
const API_KEY = `4BfitY4%2FxcxqPzYI5m38jt98xP4Et1UwstljN0Nxh88cthgjFZF3Ci59yzqYFWxCsx5KAOJ0Bx6NeVqy0u096w%3D%3D`;

function getData(nx, ny) {
  const rs = dfs_xy_conv("toXY", ny, nx); // 기상청 격좌표 변환
  console.log(`rs.x : ${rs.x}, rs.y : ${rs.y}`);

  const date = new Date();
  const nowDateStr = date.toJSON().split("T")[0].replaceAll("-", "");
  const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?servicekey=${API_KEY}&numOfRows=10&pageNO=1&dataType=JSON&base_date=${nowDateStr}&base_time=0600&nx=${rs.x}&ny=${rs.y}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // 콘솔에 data 어떤 형식으로 날아오는지 확인
      const items = data.response.body.items.item;
      for (let index = 0; index < items.length; index++) {
        if (items[index].category === "T1H") {
          // 온도 데이터
          document.getElementById("temperature").innerText = `${items[index].obsrValue}℃`;
        } else if (items[index].category === "RN1") {
          // 강수량 데이터
          document.getElementById("precipitation").innerText = `${items[index].obsrValue}mm`;
        } else if (items[index].category === "PTY") {
          // 강수형태 데이터
          const ptySpanTag = document.getElementById("pty");
          switch (items[index].obsrValue) {
            case "0":
              ptySpanTag.innerText = `없음`;
              break;
            case "1":
              ptySpanTag.innerText = `비`;
              break;
            case "2":
              ptySpanTag.innerText = `비/눈`;
              break;
            case "3":
              ptySpanTag.innerText = `눈`;
              break;
            case "4":
              ptySpanTag.innerText = `소나기`;
              break;
            case "5":
              ptySpanTag.innerText = `빗방울`;
              break;
            case "6":
              ptySpanTag.innerText = `빗방울 + 눈날림`;
              break;
            case "7":
              ptySpanTag.innerText = `눈날림`;
              break;
          }
        } else if (items[index].category === "WSD") {
          // 풍속 데이터
          document.getElementById("wind").innerText = `${items[index].obsrValue}m/s`;
        } else if (items[index].category === "REH") {
          // 습도 데이터
          document.getElementById("humidity").innerText = `${items[index].obsrValue}%`;
        } else if (items[index].category === "VEC") {
          // 풍향 데이터
          document.getElementById("wind_direction").innerText = `${items[index].obsrValue}deg`;
        }
      }
    });
}

async function handleSearch() {
  const location = document.getElementById("location").value;
  console.log(location);

  try {
    const data = await getCord(location);
    console.log(data);

    if (data.documents.length === 0) {
      alert("주소 데이터를 넣어주세요.");
    } else {
      const nx = data.documents[0].x;
      const ny = data.documents[0].y;
      console.log(`nx: ${nx}, ny: ${ny}`);

      // 지도 옵션 업데이트
      const options = {
        center: new kakao.maps.LatLng(ny, nx),
        level: 6,
      };

      const map = new kakao.maps.Map(container, options);

      // 마커 생성 및 지도에 추가
      var marker = new kakao.maps.Marker({
        position: map.getCenter(),
      });
      marker.setMap(map);

      // 지도 클릭 이벤트 등록
      kakao.maps.event.addListener(map, "click", function (mouseEvent) {
        var latlng = mouseEvent.latLng;
        marker.setPosition(latlng);
        getData(latlng.getLng(), latlng.getLat());
      });

      getData(nx, ny);
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    alert("좌표를 가져오는 중 오류가 발생했습니다.");
  }
}

function getCord(loc) {
  const query = loc;
  const kakaoApiKey = "12591b140a35092c64bf8df715f067ab";

  return fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `KakaoAK ${kakaoApiKey}`,
      },
    }
  ).then((response) => response.json());
}

function dfs_xy_conv(code, v1, v2) {
  // LCC DFS 좌표변환을 위한 기초 자료
  var RE = 6371.00877; // 지구 반경 (km)
  var GRID = 5.0; // 격자 간격 (km)
  var SLAT1 = 30.0; // 투영 위도1 (degree)
  var SLAT2 = 60.0; // 투영 위도2 (degree)
  var OLON = 126.0; // 기준점 경도 (degree)
  var OLAT = 38.0; // 기준점 위도 (degree)
  var XO = 43; // 기준점 X좌표 (GRID)
  var YO = 136; // 기준점 Y좌표 (GRID)

  var DEGRAD = Math.PI / 180.0;
  var RADDEG = 180.0 / Math.PI;

  var re = RE / GRID;
  var slat1 = SLAT1 * DEGRAD;
  var slat2 = SLAT2 * DEGRAD;
  var olon = OLON * DEGRAD;
  var olat = OLAT * DEGRAD;

  var sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);
  var rs = {};
  if (code == "toXY") {
    rs["lat"] = v1;
    rs["lng"] = v2;
    var ra = Math.tan(Math.PI * 0.25 + v1 * DEGRAD * 0.5);
    ra = (re * sf) / Math.pow(ra, sn);
    var theta = v2 * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;
    rs["x"] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    rs["y"] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  } else {
    rs["x"] = v1;
    rs["y"] = v2;
    var xn = v1 - XO;
    var yn = ro - v2 + YO;
    ra = Math.sqrt(xn * xn + yn * yn);
    if (sn < 0.0) -ra;
    var alat = Math.pow((re * sf) / ra, 1.0 / sn);
    alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

    if (Math.abs(xn) <= 0.0) {
      theta = 0.0;
    } else {
      if (Math.abs(yn) <= 0.0) {
        theta = Math.PI * 0.5;
        if (xn < 0.0) -theta;
      } else theta = Math.atan2(xn, yn);
    }
    var alon = theta / sn + olon;
    rs["lat"] = alat * RADDEG;
    rs["lng"] = alon * RADDEG;
  }
  return rs;
}
