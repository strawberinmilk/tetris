"use strict";

let tetris;
let MAP_X;
let MAP_Y;
let moveBlock;
let interval;
let time;
let gameCount;

const print=() => {
  $("#gamemenu_point").text(`tarn:${gameCount.tarn} / delete:${gameCount.delete}`);
  for(let i=0;i<=MAP_Y;i++) {
    for(let ii=0;ii<=MAP_X;ii++) {
      if(tetris[i][ii].color===null) {
        $(`.y${i}.x${ii}`).css("background-color","white");
      } else {
        $(`.y${i}.x${ii}`).css("background-color",tetris[i][ii].color);
      }
    }
  }
  //落下予測位置
  if($("#gamemenu_downmap")[0].checked&&moveBlock) {
    let list;
    let N=0;
    while(true) {
      let flag=false;
      list=[];
      for(let i=0;i<moveBlock.status.length;i++) {
        const Y=moveBlock.status[i].y+N;
        list.push({x: moveBlock.status[i].x,y: Y});
        if(Y===MAP_Y||tetris[Y+1][moveBlock.status[i].x].status==="stop") flag=true;
      }
      if(flag) break;
      N++;
    }
    for(let i=0;i<moveBlock.status.length;i++) $(`.y${list[i].y}.x${list[i].x}`).css("background-color","yellow");
  }
}

const setup=() => {
  if(!($("#gamemenu_makenewmap_X").val()&&$("#gamemenu_makenewmap_Y").val()&&
    $("#gamemenu_speed_slow").val()&&$("#gamemenu_speed_mainasu").val()&&$("#gamemenu_speed_fast").val())) {
    window.alert("Plese set stage.");
    return;
  }

  $("#gamearea").html("");
  $("#gamearea").css("width",`${22*(MAP_X+1)}px`);
  //TODOjqで書き直す
  for(let i=0;i<=MAP_Y;i++) {
    for(let ii=0;ii<=MAP_X;ii++) {
      document.getElementById("gamearea").innerHTML=
        document.getElementById("gamearea").innerHTML+`<div class="block y${i} x${ii}"></div>`;
    }
    document.getElementById("gamearea").innerHTML=
      document.getElementById("gamearea").innerHTML+`<div class="clear"></div>`;
  }
  //ここまで

  tetris=[];
  for(let i=0;i<=MAP_Y;i++) {
    tetris.push([]);
    for(let ii=0;ii<=MAP_X;ii++) tetris[i].push({status: null,color: null});
  }
  time=$("#gamemenu_speed_slow").val()*1;
  gameCount={tarn: 0,delete: 0};
  $("#gamemenu_status").text("are you ready?");
}

const makeBlock=() => {
  gameCount.tarn++;

  //加速処理
  if(gameCount.tarn%10===0&&$("#gamemenu_speed_fast").val()*1<time) {
    time-=$("#gamemenu_speed_mainasu").val()*1;
    console.log(time);
    cInterval();
    sInterval();
  }

  //一列たまったブロックの削除
  let rmList=[];
  for(let i=0;i<=MAP_Y;i++) {
    let flag=true;
    for(let ii=0;ii<=MAP_X;ii++) {
      if(tetris[i][ii].status!="stop") {
        flag=false;
        break;
      }
    }
    if(flag) rmList.push(i);
  }
  if(rmList!=[]) {
    for(let i=0;i<rmList.length;i++) {
      gameCount.delete++;
      tetris.splice(rmList[i],1);
      //TODO配列の前に追加する処理で置き換える
      tetris.push([]);
      for(let ii=MAP_Y-1;0<=ii;ii--) {
        tetris[ii+1]=[];
        for(let iii=0;iii<=MAP_X;iii++) tetris[ii+1].push(JSON.parse(JSON.stringify(tetris[ii][iii])));
      }
      tetris[0]=[];
      //ここまで
      for(let iii=0;iii<=MAP_X;iii++) tetris[0].push({status: null,color: null});
    }
  }

  //新規ブロック生成
  const newBlockList=[
    [{x: 1,y: 1},{x: 1,y: 0},{x: 0,y: 1},{x: 0,y: 0}],//0正方形
    [{x: 0,y: 3},{x: 0,y: 2},{x: 0,y: 1},{x: 0,y: 0}],//1たてなが
    [{x: 1,y: 1},{x: 0,y: 2},{x: 0,y: 1},{x: 0,y: 0}],//2凸
    [{x: 1,y: 2},{x: 1,y: 1},{x: 0,y: 1},{x: 0,y: 0}],//3立方体の展開図みたいの(右下)
    [{x: 0,y: 2},{x: 0,y: 1},{x: 1,y: 1},{x: 1,y: 0}],//4立方体の展開図みたいの(左下)
    [{x: 1,y: 2},{x: 0,y: 2},{x: 0,y: 1},{x: 0,y: 0}],//5L字
    [{x: 0,y: 2},{x: 1,y: 2},{x: 1,y: 1},{x: 1,y: 0}],//6逆L字
    [{x: 0,y: 1},{x: 0,y: 0}],//7プリウス
  ]
  //  [{x:,y:},{x:,y:},{x:,y:},{x:,y:}]
  const num=Math.floor(Math.random()*newBlockList.length);//上のリストの番号で強制指定が可能
  let newBlock=newBlockList[num];
  const newColorList=["cyan","magenta","gray","springgreen","deeppink","orange","lime"];
  const newColor=newColorList[Math.floor(Math.random()*newColorList.length)];
  for(let i=0;i<newBlock.length;i++) newBlock[i].x+=MAP_X/2-MAP_X%2/2;
  for(let i=0;i<newBlock.length;i++) {
    if(tetris[newBlock[i].y][newBlock[i].x].status==="stop") {
      gameOver();
      break;
    }
    tetris[newBlock[i].y][newBlock[i].x].status="move";
    tetris[newBlock[i].y][newBlock[i].x].color=newColor;
  }
  moveBlock={
    "status": newBlock,
    "color": newColor,
    "rotation": 0,
    "form": num
  };
  if(moveBlock.form==7) moveBlock.rotation=Math.floor(Math.random()*2)*2;
  print();
}

const pause=() => {
  if(!tetris) {
    window.alert("Plese set stage.");
    return;
  }
  if(interval) {
    cInterval();
    interval=null;
    $("#gamemenu_pausebutton").text("start");
    $("#gamemenu_status").text("pause...");
  } else {
    sInterval();
    $("#gamemenu_pausebutton").text("pause");
    $("#gamemenu_status").text("play!");
  }
}

const gameOver=() => {
  cInterval();
  $("#gamemenu_status").text("game over");
  console.log("gameOver");
}

window.onkeydown=event => {
  //  console.log(event.keyCode)
  //p
  if(event.keyCode===80) pause();

  if(!interval) return;
  //左
  if(event.keyCode===37) {
    for(let i=0;i<moveBlock.status.length;i++) {
      if(moveBlock.status[i].x===0||tetris[moveBlock.status[i].y][moveBlock.status[i].x-1].status==="stop") return;
    }
    for(let i=0;i<moveBlock.status.length;i++) {
      tetris[moveBlock.status[i].y][moveBlock.status[i].x].status=null;
      tetris[moveBlock.status[i].y][moveBlock.status[i].x].color=null;
    }
    for(let i=0;i<moveBlock.status.length;i++) {
      tetris[moveBlock.status[i].y][moveBlock.status[i].x-1].status="move";
      tetris[moveBlock.status[i].y][moveBlock.status[i].x-1].color=moveBlock.color;
      moveBlock.status[i].x--;
      print();
    }
  }
  //右
  if(event.keyCode===39) {
    for(let i=0;i<moveBlock.status.length;i++) {
      if(moveBlock.status[i].x===MAP_X||tetris[moveBlock.status[i].y][moveBlock.status[i].x+1].status==="stop") return;
    }
    for(let i=0;i<moveBlock.status.length;i++) {
      tetris[moveBlock.status[i].y][moveBlock.status[i].x].status=null;
      tetris[moveBlock.status[i].y][moveBlock.status[i].x].color=null;
    }
    for(let i=0;i<moveBlock.status.length;i++) {
      tetris[moveBlock.status[i].y][moveBlock.status[i].x+1].status="move";
      tetris[moveBlock.status[i].y][moveBlock.status[i].x+1].color=moveBlock.color;
      moveBlock.status[i].x++;
      print();
    }
  }
  //下
  if(event.keyCode===40) {
    if(moveBlock.form==7) for(let i=0;i<moveBlock.status.length;i++) {//プリウス
      if(
        MAP_Y<=moveBlock.status[i].y+4||
        tetris[moveBlock.status[i].y+2][moveBlock.status[i].x].status==="stop"||
        tetris[moveBlock.status[i].y+3][moveBlock.status[i].x].status==="stop"||
        tetris[moveBlock.status[i].y+4][moveBlock.status[i].x].status==="stop"
      ) return;
    }
    for(let i=0;i<moveBlock.status.length;i++) {
      if(moveBlock.status[i].y===MAP_Y||tetris[moveBlock.status[i].y+1][moveBlock.status[i].x].status==="stop") return;
    }
    for(let i=0;i<moveBlock.status.length;i++) {
      tetris[moveBlock.status[i].y][moveBlock.status[i].x].status=null;
      tetris[moveBlock.status[i].y][moveBlock.status[i].x].color=null;
    }
    for(let i=0;i<moveBlock.status.length;i++) {
      tetris[moveBlock.status[i].y+1][moveBlock.status[i].x].status="move";
      tetris[moveBlock.status[i].y+1][moveBlock.status[i].x].color=moveBlock.color;
      moveBlock.status[i].y++;
      print();
    }
  }


  //上
  if(event.keyCode===38) {
    let move;
    let newKaiten;
    switch(moveBlock.form+"") {
      case "0"://正方形
        return;
      case "1"://縦長
        if(moveBlock.rotation==0) {
          move=[{x: -1,y: -1},{x: 0,y: 0},{x: 1,y: 1},{x: 2,y: 2}];
          newKaiten=1;
        } else {
          move=[{x: 1,y: 1},{x: 0,y: 0},{x: -1,y: -1},{x: -2,y: -2}];
          newKaiten=0;
        }
        break;
      case "2"://凸
        switch(moveBlock.rotation+"") {
          case "0":
            move=[{x: -1,y: 0},{x: -1,y: -2},{x: 0,y: -1},{x: 1,y: 0}];
            newKaiten=1;
            break;
          case "1":
            move=[{x: 0,y: 0},{x: 2,y: 2},{x: 1,y: 1},{x: 0,y: 0}];
            newKaiten=2;
            break;
          case "2":
            move=[{x: -1,y: 0},{x: -1,y: -1},{x: 0,y: 0},{x: -1,y: 0}];
            newKaiten=3;
            break;
          case "3":
            move=[{x: 2,y: 0},{x: 0,y: 1},{x: -1,y: 0},{x: 0,y: 0}];
            newKaiten=0;
            break;
        }
        break;
      case "3"://展開図右下
        if(moveBlock.rotation==0) {
          move=[{x: -2,y: -1},{x: -1,y: 0},{x: 0,y: -1},{x: 1,y: 0}];
          newKaiten=1;
        } else {
          move=[{x: 2,y: 1},{x: 1,y: 0},{x: 0,y: 1},{x: -1,y: 0}];
          newKaiten=0;
        }
        break;
      case "4"://展開図左下
        if(moveBlock.rotation==0) {
          move=[{x: 0,y: -1},{x: 1,y: 0},{x: -1,y: -1},{x: -2,y: 0}];
          newKaiten=1;
        } else {
          move=[{x: 0,y: 1},{x: -1,y: 0},{x: 1,y: 1},{x: 2,y: 0}];
          newKaiten=0;
        }
        break;
      case "5"://L字
        switch(moveBlock.rotation+"") {
          case "0":
            move=[{x: -2,y: 0},{x: -1,y: -1},{x: 0,y: 0},{x: 1,y: 1}];
            newKaiten=1;
            break;
          case "1":
            move=[{x: 2,y: 0},{x: 2,y: 0},{x: 1,y: -1},{x: -1,y: -1}];
            newKaiten=2;
            break
          case "2":
            move=[{x: -2,y: 0},{x: -1,y: 1},{x: 0,y: 2},{x: 1,y: 1}];
            newKaiten=3;
            break;
          case "3":
            move=[{x: 2,y: 0},{x: 0,y: 0},{x: -1,y: -1},{x: -1,y: -1}];
            newKaiten=0;
            break
        }
        break;
      case "6"://逆L字
        switch(moveBlock.rotation+"") {
          case "0":
            move=[{x: -1,y: 0},{x: -1,y: 0},{x: 0,y: 1},{x: -2,y: 1}];
            newKaiten=1;
            break;
          case "1":
            move=[{x: 1,y: 0},{x: 0,y: -1},{x: -1,y: -2},{x: 2,y: -1}];
            newKaiten=2;
            break;
          case "2":
            move=[{x: 1,y: 0},{x: -1,y: 0},{x: 0,y: 1},{x: 0,y: 1}];
            newKaiten=3;
            break;
          case "3":
            move=[{x: -1,y: 0},{x: 2,y: 1},{x: 1,y: 0},{x: 0,y: -1}];
            newKaiten=0;
            break;
        }
        break;
      case "7"://プリウス
        return;
    }
    for(let i=0;i<moveBlock.status.length;i++) {
      if(moveBlock.status[i].y+move[i].y<0||MAP_Y<moveBlock.status[i].y+move[i].y) return
      if(moveBlock.status[i].x+move[i].x<0||MAP_X<moveBlock.status[i].x+move[i].x) return
      if(tetris[moveBlock.status[i].y+move[i].y][moveBlock.status[i].x+move[i].x].status==="stop") return
    }
    for(let i=0;i<moveBlock.status.length;i++) {
      tetris[moveBlock.status[i].y][moveBlock.status[i].x].status=null;
      tetris[moveBlock.status[i].y][moveBlock.status[i].x].color=null;
    }
    for(let i=0;i<moveBlock.status.length;i++) {
      tetris[moveBlock.status[i].y+move[i].y][moveBlock.status[i].x+move[i].x].status="move";
      tetris[moveBlock.status[i].y+move[i].y][moveBlock.status[i].x+move[i].x].color=moveBlock.color;
      moveBlock.status[i].y=moveBlock.status[i].y+move[i].y;
      moveBlock.status[i].x=moveBlock.status[i].x+move[i].x
    }
    moveBlock.rotation=newKaiten;
    print();
  }
}
const sInterval=() => {
  interval=setInterval(() => {
    let N=1;
    if(moveBlock.form=="7") {
      N=moveBlock.rotation;
      if(N==0) {
        N=Math.floor(Math.random()*3)+1;
        if(1<N) N=0;
      }
    }
    for(let i=0;i<moveBlock.status.length;i++) {
      if(
        moveBlock.status[i].y===MAP_Y||!tetris[moveBlock.status[i].y+N]||
        tetris[moveBlock.status[i].y+N][moveBlock.status[i].x].status==="stop"
      ) {
        for(let i=0;i<moveBlock.status.length;i++) tetris[moveBlock.status[i].y][moveBlock.status[i].x].status="stop";
        makeBlock();
        return;
      }
    }
    for(let i=0;i<moveBlock.status.length;i++) {
      tetris[moveBlock.status[i].y][moveBlock.status[i].x].status=null;
      tetris[moveBlock.status[i].y][moveBlock.status[i].x].color=null;
      tetris[moveBlock.status[i].y+1][moveBlock.status[i].x].status="move";
      tetris[moveBlock.status[i].y+1][moveBlock.status[i].x].color=moveBlock.color;
      moveBlock.status[i].y++;
    }
    print();
  },time)
}

const cInterval=() => {
  if(interval) clearInterval(interval);
}

$("#gamemenu_pausebutton").click(() => {
  pause();
})

$("#gamemenu_downmap").click(() => {
  print()
})

$("#gamemenu_makenewmap_button").click(() => {
  cInterval()
  MAP_X=$("#gamemenu_makenewmap_X").val()-1;
  MAP_Y=$("#gamemenu_makenewmap_Y").val()-1;
  setup();
  makeBlock();
})
