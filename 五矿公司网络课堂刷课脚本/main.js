// ==UserScript==
// @name         五矿公司网课刷课
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  专门针对五矿公司的网课平台的机制针对性制定的刷课逻辑
// @author       You
// @match        http://e-learning.minlist.com.cn/*/*
// @grant        none
// ==/UserScript==
(function() {
  "use strict";

  // Your code here...

  /**
   * 状态码：
   *    0 ==》 选择课程中
   *    1 ==》 判断课程状态中
   *    2 ==》 视频播放中
   *    3 ==》 从上一页自动跳转
   *
   */

  // 声明要使用的函数
  /**
   * 设置localstorage
   * @param {Object} data
   */
  function setLocalStorage(data) {
    localStorage.setItem("autoPlayStatsData", JSON.stringify(data));
  }
  /**
   * 获取localstorage
   */
  function getLocalStorage() {
    return JSON.parse(localStorage.getItem("autoPlayStatsData"));
  }

  /**
   * 回到主页
   */
  function goToListpage() {
    data.stats = 0;
    setLocalStorage(data);
    window.close();
  }

  //   声明所有页面都会使用的变量
  // 存储数据的变量
  let data = getLocalStorage();
  // 区分浏览的页面

  // ================================课程列表页================================
  if (
    window.location.href.startsWith(
      "http://e-learning.minlist.com.cn/kng/knowledgecatalogsearch.htm"
    )
  ) {
    // 向页面中注入元素
    document.body.innerHTML += `<div id="popBox">
    <p id="popBoxMsg">你好，自动播放视频脚本已经准备就绪。\r
    请输入从第几个视频开始检测（不输入默认从第一个开始检测），然后点击确定按钮开始允许脚本。\r
    脚本运行中请勿随意操作浏览器，有使用需要请另开新窗口或使用其他浏览器。\r
    点击取消隐藏本窗口，如需重新加载本窗口请刷新当前网页。</p>
    <input type="text" id="popBoxInput">
    <button id="popBoxBtnY">确定</button>
    <button id="popBoxBtnN">取消</button>
    </div>`;

    document.head.innerHTML += `<style>
    #popBox,
    #popBoxMsg {
    margin: 0;
    padding: 0;
    }
    #popBox {
    position: fixed;
    min-width: 300px;
    min-height: 50px;
    margin: 0 auto;
    left: 20px;
    top: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    text-align: center;
    padding: 10px;
    overflow: hidden;
    background-color: #fff;
    z-index: 99999;
    }
    #popBoxMsg {
    margin: 0;
    padding: 0;
    }


    #popBoxBtnY,
    #popBoxBtnN{
        margin: 10px 10px 0;
    }

    #popBoxInput{
        display: block;
        width: 100%;
    }
    </style>`;

    // 获取必要元素
    let startBtn = document.querySelector("#popBoxBtnY"), // 开始按钮
      quitBtn = document.querySelector("#popBoxBtnN"), // 取消按钮
      inputEle = document.querySelector("#popBoxInput"), // 输入框
      msgEle = document.querySelector("#popBoxMsg"), // 提示信息元素
      popUpBox = document.querySelector("#popBox"), // 弹出框盒子
      videoList = document.querySelector(".el-kng-img-list").children, // 课程列表
      currentPage = parseInt(
        document.querySelector(".current.pagenumber").innerText
      ), // 当前页页码
      nextPageBtn = document.querySelectorAll(".pagetext")[1]; // 下一页按钮

    /**
     * 选择一个课程开始学习
     */
    function selectClass() {
      videoList[data.currentVideo]
        .querySelector(".el-placehold-body.hand")
        .click();
    }

    // 判断是否是第一次执行脚本
    if (getLocalStorage()) {
      //   不是第一次加载
      data = getLocalStorage();
      let msg = `上次自动播放到：第${data.currentPage}页，第${data.currentVideo}个视频。如果继续从该处开始请先跳转到该页，然后点击确定直接开始，如果想重新选择请输入课程编号（左->右，上→下，1-n）`;
      msgEle.innerText = msg;
    } else {
      //   第一次加载脚本
      data = {
        stats: 0,
        currentVideo: 0,
        currentPage: currentPage
      };
      setLocalStorage(data);
    }

    //   确定按钮
    startBtn.addEventListener("click", () => {
      // 获取用户输入值
      // 判断输入值是否有效
      if (!(isNaN(parseInt(inputEle.value)) || inputEle.value === "")) {
        data.currentVideo = parseInt(inputEle.value) - 1;
      }
      if (data.currentVideo < 0) {
        data.currentVideo = 0;
      }
      if (data.currentVideo >= videoList.length) {
        data.currentVideo = videoList.length - 1;
      }
      popUpBox.style.visibility = "hidden";

      //   点击课程跳转
      selectClass();
      // 修改状态码
      data.stats = 1;
      setLocalStorage(data);

      //   启动定时器
      // 每隔1s检查一次状态码是否回到了主页
      let timeID = setInterval(() => {
        data = getLocalStorage();
        // 检查状态码
        if (data.stats === 0) {
          data.currentVideo++;

          //   本页学习完成自动跳转下一页
          if (data.currentVideo >= videoList.length) {
            //   当前页面已学习完成
            data.currentVideo = 0;
            data.currentPage = parseInt(
              document.querySelector(".current.pagenumber").innerText
            )++;
            data.stats = 3;
            setLocalStorage(data);
            nextPageBtn.click();
            clearInterval(timeID);
            return;
          }

          selectClass();
          data.stats = 1;
          setLocalStorage(data);
        }
      }, 1000);
    });

    //   取消按钮
    quitBtn.addEventListener("click", () => {
      // 什么都不干
      popUpBox.style.visibility = "hidden";
    });

    // 设置一个定时器防止点击下一页后无法自动运行
    setTimeout(() => {
      if (data.stats === 3) {
        startBtn.click();
      }
    }, 5000);
  }
  // ================================课程列表页================================

  // ================================课程详情页================================
  if (
    window.location.href.startsWith(
      "http://e-learning.minlist.com.cn/kng/view/package"
    )
  ) {
    // 检查是否存在 #btnStartStudy 这个元素，
    // 存在说明没有学习过，点击开始学习，
    // 不存在说明已学习完成==》修改状态码 ===》关闭网页 ===》 重新选课
    setTimeout(() => {
      let startStudyBtn = document.querySelector("#btnStartStudy");
      if (startStudyBtn) {
        data.stats = 2;
        setLocalStorage(data);
        startStudyBtn.click();
      } else {
        // 修改状态码
        data.stats = 0;
        setLocalStorage(data);
        // 关闭当前网页回到课程列表页
        window.close();
      }
    }, 5000);
  }
  // ================================课程详情页================================

  // ================================视频课程及文本课程学习页================================
  if (
    window.location.href.startsWith(
      "http://e-learning.minlist.com.cn/kng/course/package"
    ) ||
    window.location.href.startsWith(
      "http://e-learning.minlist.com.cn/kng/view/document"
    )
  ) {
    // 判断课程是否学习完成的方法
    function isFinish() {
      return document.querySelector("#ScheduleText").innerText == "100%"
        ? true
        : false;
    }

    //   获取课程完成时间的方法
    function getClassTime() {
      let classTimeEle = document.querySelector("#spanLeavTimes");

      if (classTimeEle) {
        let classTimeText = classTimeEle.innerText;
        // 可能是分钟可能是秒
        //   判断网速情况，课程完成时间是否已经加载
        if (classTimeText == "0秒") {
          if (isFinish()) {
            // 说明课程已经完成
            return false;
          }

          //   说明当前课程时间还没加载出来
          // 5s后重新获取课程时间
          setTimeout(() => {
            return getClassTime();
          }, 5000);
        } else {
          //   课程时间已经加载出来
          let classTimeArr = classTimeText.match(/(\d)+/g);
          let classTime = 0;

          function time2ms(timeArr, callback) {
            for (let key in timeArr) {
              callback(key);
            }
          }

          if (classTimeText.includes("分钟") && classTimeText.includes("秒")) {
            // 有分钟和秒
            time2ms(classTimeArr, i => {
              if (i == 0) {
                classTime += classTimeArr[i] * 60 * 1000;
              }
              if (i == 1) {
                classTime += classTimeArr[i] * 1000;
              }
            });
          }

          if (classTimeText.includes("分钟") && !classTimeText.includes("秒")) {
            // 只有分钟
            time2ms(classTimeArr, i => {
              if (i == 0) {
                classTime += classTimeArr[i] * 60 * 1000;
              }
            });
          }
          if (!classTimeText.includes("分钟") && classTimeText.includes("秒")) {
            // 只有秒
            time2ms(classTimeArr, i => {
              i;
              if (classTimeArr.length == 1) {
                classTime += classTimeArr[i] * 1000;
              }
            });
          }

          return classTime;
        }
      }
      return false;
    }

    // 通过定时器判断学习是否完成
    function setTimeoutCheckStats() {
      //   网页开始加载5s后，开始进行学习进度判断
      setTimeout(() => {
        //   触发视频播放
        let videoPlayer = document.querySelectorAll("video");
        if (videoPlayer[0]) {
          videoPlayer.forEach(ele => {
            ele.play();
          });
        }

        let classTime = getClassTime();
        if (!isNaN(classTime)) {
          // 课程处于未完成状态

          // 根据课程时长设置定时器检查课程是否完成
          setTimeout(() => {
            if (isFinish()) {
              // 课程完成 ===》 修改状态码 ==》 关闭网页 回到课程列表选择下一个课程
              goToListpage();
            } else {
              setTimeoutCheckStats();
            }
          }, classTime);
        } else {
          //   课程已完成或存在其他未可知情况==》 关闭网页回到课程列表选择下一课程进行学习
          goToListpage();
        }
      }, 3000);
    }

    // main
    setTimeoutCheckStats();
  }
  // ================================视频课程及文本课程学习页================================
})();
