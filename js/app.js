var bodyWidth = $("body").css("width");
// $("div.items").css(
//   "width",
//   bodyWidth.substring(0, bodyWidth.length - 2) - 380 + "px"
// );


/* pdf */
// var doc = new jsPDF();

// doc.text("Hello world!", 10, 10);
// doc.save("a4.pdf");




//参与抽奖人数初始值
var itemCount = 50;
//跑马灯循环
var tx;
var runtx;
//是否正在运行跑马灯
var isRun = false;
//是否跑马灯暂停状态
var pause = false;
//排名分组显示算法已经取消
//var ts=20
//默认跑马灯频率
var pl = 300;
//程序是否开始运行用于判断程序是否开始运行
var isStart = false;

var zzs = "#98ff98";
//跑马灯音效
var runingmic = document.getElementById("runingmic");
runingmic.volume = 0.5;
//中奖音效
var pausemic = document.getElementById("pausemic");
pausemic.volume = 1.0;

var keyStatus = false;

var awardList = [];

var currnetAwardLuck = -1;

$("document").ready(function() {

  //排名信息本地存储
  if (localStorage.getItem("sequence")) {
    var ssHtml = localStorage.getItem("sequence");
    $(".ss").html(ssHtml);
  }
  if (localStorage.getItem("itemCount")) {
    itemCount = localStorage.getItem("itemCount");
  } else {
    localStorage.setItem("itemCount", itemCount);
  }
  $("#personCount").val(itemCount);
  //创建item小方格
  for (var i = 1; i <= itemCount; i++) {
    $("div.items").append("<div class='item i" + i + "'>" + i + "</div>");
  }
  //本地存储奖品信息
  if (localStorage.getItem("awardList")) {
    awardList = JSON.parse(localStorage.getItem("awardList"));
    awardList.forEach(function(item) {
      $("#ulList").append(`<li><span>奖品名称</span> <input type="text" disabled="true" value="${item.name}" /> <span>奖品数量</span> <input type="number" disabled="true" value="${item.num}"/> <span class="startAward" data-start="1" >开始抽奖</span></li>`);
    });
  }
  //初始化排序信息
  $(".ss li").each(function(idx, item) {
    $(".i" + $(item).attr("data-number")).addClass("ignore");
  });

  //$("div.menu").css("height",$("div.items").css("height"));
  $("body").keyup(function(e) {
    keyStatus = false;
  });
  //全局键盘事件监听
  $("body").keydown(function(e) {
    //按F1弹出帮助窗口
    if (e.keyCode == 112) {
      e.preventDefault();
      showReadme();
      return false;
    }
    //ESC案件呼出隐藏菜单
    if (e.keyCode == 27) {
      if ($(".help:hidden").size() > 0) $(".help").show();
      else $(".help").hide();

      return false;
    }
    // e.preventDefault();
  });

  //打开高级设置窗口
  $("a.config").click(function() {
    pause = true;
    runingmic.pause();
    var d = dialog({
      title: "抽奖参数设定",
      content: $("#model"),
      okValue: "确定",
      ok: function() {
        let flag = false;
        if ($("#reset:checked").val() && confirm("点击确定将清空抽奖结果。")) {
          flag = true;
          localStorage.removeItem("itemCount");
          localStorage.removeItem("awardList");
          localStorage.removeItem("sequence");
        }
        if ($("#personCount").val()) {
          localStorage.setItem("itemCount", $("#personCount").val());
        }
        if (
          $("div.item:not(.ignore)").size() < $("#everyAwardCount").val() &&
          !flag
        ) {
          alert("剩余人数小于当前抽奖人数！");
          return;
        }
        window.location.reload();
      },
      onclose: function() {
        pause = false;
      }
    });
    d.show();
  });

  //清除错误中奖号
  $("body").on("click", ".item.ignore", function() {
    var inputItemCount = prompt(
      "请输入点击的号码来进行删除中奖号码（例如“12”）。"
    );
    if (inputItemCount == $(this).text()) {
      $("li[data-number=" + $(this).text() + "]").remove();
      $(this).removeClass("ignore");
      localStorage.setItem("sequence", $(".ss").html());
    } else {
    }
  });

  $("#addAward").click(function() {
    $("#ulList").append('<li><span> 奖品名称</span> <input type="text"> <span>奖品数量</span> <input type="number"> <span class="startAward">开始抽奖</span> <span class="awardBtn">删除</span> </li>');
  });

  $("#ulList").click(function(e) {
    console.log(e);
    if (e.target.className.indexOf("awardBtn") != -1) {
      $(e.target.parentNode).remove();
    } else if (e.target.className.indexOf("startAward") != -1) {
      if ($(e.target).attr("data-start") == "1") {
        currnetAwardLuck = $(e.target.parentNode.children[1]).val();
        console.log(currnetAwardLuck);
        let curNum = +$("#countNum").val();
        let allLuks = 0,list = [];
        JSON.parse(localStorage.getItem("awardList")).forEach(
          item => {
            if (item.name == currnetAwardLuck) {
              list = item.list;
              allLuks = item.num;
            }
          }
        );
        if (list.length >= allLuks ){
          alert("当前奖项已经抽完");
        } else if ((curNum > (allLuks - list.length)) ) {
          alert("当前抽奖人数大于可以剩余奖品");
        } else {
          isRun = !isRun;
          if (isRun) {
            $(e.target).text("确认");
            $(e.target).attr("data-start", "1");
            // isStart = true;
            if (!isStart) {
              isStart = true;
              startApp();
            }else {
              runingmic.play();
            }
          } else {
            var it = [],
              htmls = "";
            $(".item.active").each(function(index, item) {
              var a = +$(item).text();
              htmls += `<li data-number=${a}>${a}号：${currnetAwardLuck}</li>`;
              it.push(a);
            });
            let awardList = JSON.parse(localStorage.getItem("awardList"));
            awardList.forEach(item => {
              if (item.name == currnetAwardLuck) {
                item.list.push(...it);
              }
            });
            localStorage.setItem("awardList", JSON.stringify(awardList));
            $(".ss ol").append(htmls);
            localStorage.setItem("sequence", $(".ss").html());
            runingmic.pause();
            //播放中奖音效
            pausemic.currentTime = 0;
            pausemic.play();
            $(".item.active").addClass("ignore");
            $(".item.active").pulsate({ color: zzs, repeat: 5 }); //#98ff98
            $(e.target).text("开始抽奖");
            $(".active").removeClass("active");
          }
        }
      } else {
        $(e.target.parentNode)
          .find("input")
          .attr("disabled", true);
        let name = $(
          e.target.parentNode.children[1]
        ).val();
        let nums = +$(
          e.target.parentNode.children[3]
        ).val();
        let awardList = JSON.parse(localStorage.getItem("awardList")) || [];
        awardList.push({ name: name, num: nums, list: [] });
        localStorage.setItem("awardList", JSON.stringify(awardList));
        currnetAwardLuck = name;
        if (!isStart) {
          isStart = true;
          startApp();
        } 
        isRun = !isRun;
        $(e.target).text("确认");
        $(e.target).attr("data-start", "1");
        $(e.target.nextSibling.nextSibling).remove();
      }
    }
  });
});
//程序开始入口
function startApp() {
  var inputItemCount = +$("#countNum").val();
  if ($("div.item:not(.ignore)").size() < inputItemCount) {
    alert("当前抽奖人数大于等于剩余抽奖人数，请求修改抽奖人数");
    return false;
  }
  console.log(inputItemCount);
  //开始播放跑马灯音效
  runingmic.play();
  //产生随机数临时变量
  var rand = 0;
  var counts = [];
  tx = setInterval(function() {
    inputItemCount = +$("#countNum").val();
    if (isRun) {
      while (true) {
        counts = [];
        for (let index = 0; index < inputItemCount; index++) {
          rand = Math.floor(
            Math.random() *
              ($("div.item:not(.ignore)").size() - inputItemCount + 1)
          );
          var flag = false;
          counts.forEach(item => {
            if (item == rand) {
              flag = true;
            }
          });
          if (flag && rand != 0) {
            --index;
          } else {
            counts.push(rand);
          }
        }
        break;
      }
      $(".item.active").removeClass("active");
      for (let index = 0; index < counts.length; index++) {
        const element = counts[index];
        $("div.item:not(.ignore):not(.active)")
          .eq(element)
          .addClass("active");
      }
    }
  }, pl);
  runtx = setInterval(function() {
    runingmic.currentTime = 0;
  }, 7000);
}
function showReadme() {
  var d = dialog({
    title: "帮助信息",
    content: $(".readme"),
    width: "400px",
    okValue: "关闭",
    ok: function() {},
    onclose: function() {
      pause = false;
    }
  }).show();
}

var dynamicLoading = {
  css: function(path) {
    if (!path || path.length === 0) {
      throw new Error('argument "path" is required !');
    }
    var head = document.getElementsByTagName("head")[0];
    var link = document.createElement("link");
    link.href = path;
    link.rel = "stylesheet";
    link.type = "text/css";
    head.appendChild(link);
  },
  js: function(path) {
    if (!path || path.length === 0) {
      throw new Error('argument "path" is required !');
    }
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.src = path;
    script.type = "text/javascript";
    head.appendChild(script);
  }
};
