// 커스텀 커서 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  class CustomCursor {
    constructor() {
      this.cursor = {
        element: document.querySelector("#custom-cursor"),
        pos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        speed: 0.15,  //커스텀 커서 속도
      };

      this.cursor.mouse = { x: this.cursor.pos.x, y: this.cursor.pos.y };
      this.xSet, this.ySet, this.dt;

      this.links = document.querySelectorAll("[custom-cursor-ani]");  //해당 선택자 존재시, 커서 애니메이션

      this.animate();
      this.events();
    }

    animate() {
      gsap.set(this.cursor.element, { xPercent: -50, yPercent: -50 });

      this.xSet = gsap.quickSetter(this.cursor.element, "x", "px");
      this.ySet = gsap.quickSetter(this.cursor.element, "y", "px");

      window.addEventListener("mousemove", (e) => {
        this.cursor.mouse.x = e.x;
        this.cursor.mouse.y = e.y;
      });

      gsap.ticker.add(() => {
        this.dt =
          1.0 -
          Math.pow(1.0 - this.cursor.speed, gsap.ticker.deltaRatio());
        this.cursor.pos.x +=
          (this.cursor.mouse.x - this.cursor.pos.x) * this.dt;
        this.cursor.pos.y +=
          (this.cursor.mouse.y - this.cursor.pos.y) * this.dt;
        this.xSet(this.cursor.pos.x);
        this.ySet(this.cursor.pos.y);
      });
    }

    events() {
      const animation = gsap.fromTo(
        this.cursor.element,
        { scale: 1 },
        {
          scale: 4,
          duration: 0.35,
          ease: "power4.inOut",
          paused: true,
        }
      );

      this.links.forEach((link) => {
        link.addEventListener("mouseenter", () => animation.play());
        link.addEventListener("mouseleave", () => animation.reverse());
      });
    }
  }

  new CustomCursor();
});




/*
// 커서 별 파티클 ======================================================================
let start = performance.now();

const originPosition = { x: 0, y: 0 };

const last = {
  starTimestamp: start,
  starPosition: originPosition,
};

const state = {
  pointer: originPosition,   // page 기준 좌표
  hasPointer: false,
  running: true,
};

const config = {
  starAnimationDuration: 1500,
  minimumTimeBetweenStars: 250,
  minimumDistanceBetweenStars: 75,
  colors: ["249 146 253", "252 254 255"],
  sizes: ["1.4rem", "1rem", "0.6rem"],
  animations: ["fall-1", "fall-2", "fall-3"]
};

let count = 0;

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const selectRandom = items => items[rand(0, items.length - 1)];

const withUnit = (value, unit) => `${value}${unit}`;
const px = value => withUnit(value, "px");
const ms = value => withUnit(value, "ms");

const calcDistance = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const appendElement = el => document.body.appendChild(el);
const removeElement = (el, delay) => setTimeout(() => {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}, delay);

const createStar = position => {
  const star = document.createElement("span");
  const color = selectRandom(config.colors);

  star.className = "star";
  star.style.left = px(position.x);
  star.style.top = px(position.y);
  star.style.fontSize = selectRandom(config.sizes);
  star.style.color = `rgb(${color})`;
  star.textContent = "✨";
  star.style.textShadow = `0px 0px 1.5rem rgb(${color} / 0.5)`;

  star.style.animationName =
    config.animations[count++ % config.animations.length];
  star.style.animationDuration = ms(config.starAnimationDuration);

  appendElement(star);
  removeElement(star, config.starAnimationDuration);
};

const updateLastStar = (position, now) => {
  last.starTimestamp = now;
  last.starPosition = position;
};

const shouldCreateStar = (position, now) => {
  const farEnough =
    calcDistance(last.starPosition, position) >= config.minimumDistanceBetweenStars;
  const longEnough =
    (now - last.starTimestamp) > config.minimumTimeBetweenStars;

  return farEnough || longEnough;
};

// 포인터 이벤트: pageX / pageY 사용
const setPointerFromEvent = (x, y) => {
  state.pointer = { x, y };
  state.hasPointer = true;
};

window.addEventListener("mousemove", (e) => {
  setPointerFromEvent(e.pageX, e.pageY);
}, { passive: true });

window.addEventListener("touchmove", (e) => {
  const t = e.touches && e.touches[0];
  if (!t) return;
  setPointerFromEvent(t.pageX, t.pageY);
}, { passive: true });

document.body.addEventListener("mouseleave", () => {
  state.hasPointer = false;
}, { passive: true });

// requestAnimationFrame 루프
const tick = (now) => {
  if (state.running && state.hasPointer) {
    const pos = state.pointer;

    if (shouldCreateStar(pos, now)) {
      createStar(pos);
      updateLastStar(pos, now);
    }
  }

  requestAnimationFrame(tick);
};

requestAnimationFrame(tick);

*/



// 메인 포지션 텍스트 롤링 ======================================================================
document.addEventListener('DOMContentLoaded', function () {
    const pauseMs = 3000;  // 멈춰있는 시간
    const moveMs = 1500;  // 이동하는 시간

    document.querySelectorAll('.main-rolling-txt').forEach((roller) => {
        const originals = Array.from(roller.children).filter(el => el.tagName === 'SPAN');
        const n = originals.length;
        if (n <= 1) return;

        const track = document.createElement('span');
        track.className = 'rolling-track';

        originals.forEach(el => track.appendChild(el));                 // 원본 이동
        originals.forEach(el => track.appendChild(el.cloneNode(true))); // 복제 추가

        roller.innerHTML = '';
        roller.appendChild(track);

        // 아이템 높이 계산(렌더 이후)
        requestAnimationFrame(() => {
            const first = track.querySelector('span');
            const itemH = first.getBoundingClientRect().height || parseFloat(getComputedStyle(roller).lineHeight) || 20;

            let idx = 0; // 현재 보여줄 인덱스(0~n)

            function step() {
                // 1) 멈춤
                setTimeout(() => {
                    // 2) 이동(transition)
                    idx += 1;
                    track.style.transition = `transform ${moveMs}ms ease`;
                    track.style.transform = `translateY(${-idx * itemH}px)`;

                    // 3) 이동 끝난 뒤 처리
                    setTimeout(() => {
                        // idx가 n에 도달하면 복제 구간에 들어온 상태
                        // 다음 루프를 자연스럽게 하기 위해 즉시 0으로 점프(transition 없이)
                        if (idx >= n) {
                            track.style.transition = 'none';
                            idx = 0;
                            track.style.transform = 'translateY(0)';
                            // transition 제거가 적용되도록 한 프레임 넘겨줌
                            requestAnimationFrame(() => { });
                        }
                        // 다음 스텝 반복
                        step();
                    }, moveMs);

                }, pauseMs);
            }

            step();
        });
    });
});




// 다양한 경험 MIX 섹션 ======================================================================
gsap.registerPlugin(ScrollTrigger);

const section = document.querySelector("#mixVision");
const bg = section.querySelector(".bg");
const word01 = section.querySelector(".word01");
const word02 = section.querySelector(".word02");

/* ------------------------------------------------------------------
   시작 clip-path 값 계산 (여기 숫자 키우면 시작 이미지 더 작아짐)
------------------------------------------------------------------ */
function getStartInsetPx(){
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const topBottom = Math.max(120, Math.min(220, vh * 0.45)); // 초기 높이 (맨 뒤 숫자 높을 수록 Clip-path 작아짐)
  const leftRight = Math.max(160, Math.min(320, vw * 0.45)); // 초기 넓이 (맨 뒤 숫자 높을 수록 Clip-path 작아짐)

  return { t: topBottom, r: leftRight, b: topBottom, l: leftRight };
}

/* ------------------------------------------------------------------
   bg 중앙 정렬을 GSAP가 관리 (pin 시 위치 튐 방지)
------------------------------------------------------------------ */

// bg 중앙 정렬: CSS transform 대신 GSAP로 고정
gsap.set(bg, {
  left: "50%",
  top: "50%",
  xPercent: -50,
  yPercent: -50
});

function applyStartClip(){
  const ins = getStartInsetPx();
  gsap.set(bg, { clipPath: `inset(${ins.t}px ${ins.r}px ${ins.b}px ${ins.l}px)` });
}
applyStartClip();

// 텍스트 width 측정(리빌용)
function getAutoWidthPx(el){
  const prev = { width: el.style.width, position: el.style.position, visibility: el.style.visibility };
  el.style.width = "auto";
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  const w = el.getBoundingClientRect().width;
  el.style.width = prev.width;
  el.style.position = prev.position;
  el.style.visibility = prev.visibility;
  return w;
}
const w1 = getAutoWidthPx(word01);
const w2 = getAutoWidthPx(word02);

gsap.set([word01, word02], { width: 0, opacity: 0 });

// refresh 시에도 clip 시작값 재적용
function clipStr(){
  const ins = getStartInsetPx();
  return `inset(${ins.t}px ${ins.r}px ${ins.b}px ${ins.l}px)`;
}

// ====== “턱턱 끊김” 방지를 위한 HOLD 구간 길이 ======
// 값이 클수록: pin 걸린 후/끝나기 전 “정지 구간”이 길어짐
const HOLD_IN = 3;   // 시작 직후 멈춤
const HOLD_MID = 0;  // word01 후 멈춤
const HOLD_OUT = 3;  // 끝나기 전 멈춤

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: "#mixVision",
    start: "top top",
    end: "+=3000",       // hold가 늘었으니 스크롤 길이도 같이 늘리는 게 자연스러움
    scrub: 1,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onRefresh: applyStartClip
  }
});

// ✅ 더미 엘리먼트 없이 “빈 tween”으로 hold 만들기
tl
.to({}, { duration: HOLD_IN }) // 0) pin 걸린 직후 잠깐 정지(아무 변화 없음)

.fromTo(word01,
  { width: 0, opacity: 0 },
  { width: w1, opacity: 1, ease: "power2.out", duration: 8 },
  ">"
)

.to({}, { duration: HOLD_MID }) // 1) word01 끝난 뒤 잠깐 정지

.fromTo(bg,
  { clipPath: clipStr },
  { clipPath: "inset(0px 0px 0px 0px)", ease: "none", duration: 8 },
  ">"
)

.fromTo(word02,
  { width: 0, opacity: 0 },
  { width: w2, opacity: 1, ease: "power2.out", duration: 8 },
  "<0.2"
)

.to({}, { duration: HOLD_OUT }); // 2) 모든 연출 끝난 뒤 잠깐 정지(핀 풀리기 전 완충)

window.addEventListener("load", () => ScrollTrigger.refresh());






// 다양한 경험 리스트 섹션 ======================================================================
gsap.registerPlugin(ScrollTrigger);

gsap.to(".inc03_wrap .item01", {
  scrollTrigger: {
    trigger: ".inc03_wrap .cont01",
    start:"-100% top",
    toggleClass:{targets:'.inc03_wrap .item01',className:'on'},
    scrub: 2,
  }
});

gsap.to(".inc03_wrap .item02", {
  scrollTrigger: {
    trigger: ".inc03_wrap .cont02",
    start:"top top",
    toggleClass:{targets:'.inc03_wrap .item02',className:'on'},
    scrub: 2,
  }
});

gsap.to(".inc03_wrap .item03", {
  scrollTrigger: {
    trigger: ".inc03_wrap .cont03",
    start:"top top",
    toggleClass:{targets:'.inc03_wrap .item03',className:'on'},
    scrub: 2,
  }
});



// 다양한 경험 리스트 섹션 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const sections = gsap.utils.toArray(".demo-wrapper section");

  sections.forEach((section, index) => {
    const w = section.querySelector(".wrapper");
    if (!w) return;

    const isOdd = index % 2 === 1;

    const getValues = () => {
      const maxTranslate = w.scrollWidth - section.clientWidth;
      const safeMax = Math.max(0, maxTranslate);

      // 🔁 좌우 방향 반전
      const xStart = isOdd ? -safeMax : "100%";
      const xEnd = isOdd ? 0 : -safeMax;

      return { xStart, xEnd };
    };

    const { xStart, xEnd } = getValues();

    gsap.fromTo(
      w,
      { x: xStart },
      {
        x: xEnd,
        ease: "none",
        invalidateOnRefresh: true,
        scrollTrigger: {
          trigger: section,
          scrub: 1,
          start: "top bottom",
          onRefresh: () => {
            const v = getValues();
            gsap.set(w, { x: v.xStart });
          },
        },
      }
    );
  });

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });

  setTimeout(() => ScrollTrigger.refresh(), 300);
});






//====================================================================== GSAP ======================================================================


document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // 인트로 ======================================================================
    const loading = document.querySelector('.intro');
    const rotate = document.querySelectorAll('.rotate');
    const opacity = document.querySelectorAll('.opacity');

    if (loading) {
        setTimeout(() => loading.classList.add('scene1'), 0);
        setTimeout(() => loading.classList.add('scene2'), 5000);
        setTimeout(() => rotate.forEach(r => r.classList.add('on')), 5000);
        setTimeout(() => opacity.forEach(o => o.classList.add('on')), 5000);
    }

    // 01 메인 비주얼 ======================================================================
    gsap.timeline({
        scrollTrigger: {
            trigger: '.visual',
            start: '100% 100%',
            end: '100% 0%',
            scrub: 1,
            // markers: true,
        }
    })

    .to('.logoWrap #symbol1', { x: -150, y: 250, rotate: 20, opacity: 0.5, ease: 'none', duration: 5 }, 0)
    .to('.logoWrap #symbol2', { x: -30, y: 150, rotate: -10, opacity: 0.5, ease: 'none', duration: 5 }, 0)
    .to('.logoWrap #symbol3', { x: 0, y: 400, rotate: -10, opacity: 0.5, ease: 'none', duration: 5 }, 0)
    .to('.logoWrap #symbol4', { x: 50, y: 300, rotate: 10, opacity: 0.5, ease: 'none', duration: 5 }, 0)
    .to('.logoWrap #symbol5', { x: 100, y: 100, rotate: -10, opacity: 0.5, ease: 'none', duration: 5 }, 0)
    .to('.logoWrap #symbol6', { x: 50, y: 400, rotate: 20, opacity: 0.5, ease: 'none', duration: 5 }, 0);



    // design-portfolio 배경 색상 변경 =========================================================
    const designPortfolioBgChange = document.querySelector('#design-portfolio');
    if (designPortfolioBgChange) {
    ScrollTrigger.create({
        trigger: designPortfolioBgChange,
        start: 'top 50%',
        end: 'bottom 80%',
        onEnter: () => designPortfolioBgChange.classList.add('background-reverse'),
        onEnterBack: () => designPortfolioBgChange.classList.add('background-reverse'),
        onLeave: () => designPortfolioBgChange.classList.remove('background-reverse'),
        onLeaveBack: () => designPortfolioBgChange.classList.remove('background-reverse'),
        // markers: true,
    });
    }

    // graphic-design 기준 배경 변경 =========================================================
    const graphicDesign = document.querySelector('.graphic-design');
    if (graphicDesign && designPortfolioBgChange) {
    ScrollTrigger.create({
        trigger: graphicDesign,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () =>
        designPortfolioBgChange.classList.add('background-reverse2'),
        onEnterBack: () =>
        designPortfolioBgChange.classList.add('background-reverse2'),
        onLeave: () =>
        designPortfolioBgChange.classList.remove('background-reverse2'),
        onLeaveBack: () =>
        designPortfolioBgChange.classList.remove('background-reverse2'),
        // markers: true,
    });
    }


    // 디자인 포트폴리오 타이틀 ======================================================================
    gsap.utils.toArray('.con2 .mainTextBox').forEach((box) => {
        const targets = box.querySelectorAll('.title i');
        if (!targets.length) return;

        gsap.set(targets, { y: 300 }); // 시작 위치 (미리 아래로)

        gsap.timeline({
            scrollTrigger: {
                trigger: box,
                start: 'top 40%',
                toggleActions: 'restart none none reverse',
            }
        })
            .to(targets, { y: 0, ease: 'power3.out', duration: 0.6, stagger: 0.1 }, 0);
    });


    // 디자인 포트폴리오 서브 타이틀 ======================================================================
    gsap.utils.toArray('.con2 .subText').forEach((box) => {
    const targets = box.querySelectorAll('p'); 
    if (!targets.length) return;

    gsap.set(targets, { y: 300, opacity: 0 }); 

    gsap.timeline({
        scrollTrigger: {
        trigger: box,                
        start: 'top 50%',             
        toggleActions: 'restart none none reverse', 
        }
    })
    .to(targets, {
        y: 0,
        opacity: 1,
        ease: 'power3.out',
        duration: 0.6,
        stagger: 0.2 
    }, 0);
    });
    

    // -----------------section2------------------------------------------------
    function observeDirectionReset(selector, activeClass, threshold = 0.3) {
        const el = document.querySelector(selector);
        if (!el) return;

        let lastY = window.scrollY;

        const observer = new IntersectionObserver((entries) => {
            const currentY = window.scrollY;
            const scrollingUp = currentY < lastY;
            lastY = currentY;

            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(activeClass);
                    return;
                }

                const rootH = entry.rootBounds ? entry.rootBounds.height : window.innerHeight;
                const leftToBottom = entry.boundingClientRect.top >= rootH;

                if (scrollingUp && leftToBottom) entry.target.classList.remove(activeClass);
            });
        }, { threshold });

        observer.observe(el);
    }

    observeDirectionReset('#section2>div>h2', 'active4', 1);
    observeDirectionReset('#section2>div>div', 'active5', 0.3);
    observeDirectionReset('.basic-information', 'active6', 0.3);


    // -----------------section4-----------------------------------------------
    const targetText9 = document.querySelector('#section4 h3');
    if (targetText9) {
        const observerText9 = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 1 });
        observerText9.observe(targetText9);
    }

    const targetText10 = document.querySelectorAll('#section4 .web-project-box');
    if (targetText10.length) {
        const observerText10 = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        targetText10.forEach((box) => observerText10.observe(box));
    }


    // Next-Step 도달 시 bg-change 적용 ==============================================
    const nextStepSection = document.querySelector('.Next-Step');

    if (nextStepSection) {
    ScrollTrigger.create({
        trigger: nextStepSection,
        start: 'top 50%',
        onEnter: () =>
        nextStepSection.classList.add('bg-change'),
        onEnterBack: () =>
        nextStepSection.classList.add('bg-change'),
        onLeave: () =>
        nextStepSection.classList.remove('bg-change'),
        onLeaveBack: () =>
        nextStepSection.classList.remove('bg-change'),
        // markers: true,
    });
    }


    // 그래픽 디자인 타이틀 ======================================================================
    gsap.utils.toArray('.graphic-design .mainTextBox').forEach((box) => {
        const targets = box.querySelectorAll('.title i');
        if (!targets.length) return;

        gsap.set(targets, { y: 300 }); // 시작 위치 (미리 아래로)

        gsap.timeline({
            scrollTrigger: {
                trigger: box,
                start: 'top 50%',
                toggleActions: 'restart none none reverse',
            }
        })
            .to(targets, { y: 0, ease: 'power3.out', duration: 0.6, stagger: 0.1 }, 0);
    });


    // 그래픽 디자인 포트폴리오 서브 타이틀 ======================================================================
    gsap.utils.toArray('.graphic-design .subText').forEach((box) => {
    const targets = box.querySelectorAll('p'); 
    if (!targets.length) return;

    gsap.set(targets, { y: 300, opacity: 0 }); 

    gsap.timeline({
        scrollTrigger: {
        trigger: box,                
        start: 'top 50%',             
        toggleActions: 'restart none none reverse', 
        }
    })
    .to(targets, {
        y: 0,
        opacity: 1,
        ease: 'power3.out',
        duration: 0.6,
        stagger: 0.2 
    }, 0);
    });


    //  그래픽 디자인 리스트 ======================================================================
    gsap.utils.toArray('.graphic-design .listBox li').forEach((selector, t) => {
        ScrollTrigger.create({
            trigger: selector,
            start: 'top bottom',
            onEnter: () => {
                gsap.set(selector, { rotationX: '-65deg', z: '-500px', opacity: 0 });
                gsap.to(selector, { rotationX: 0, z: 0, opacity: 1, delay: (t % 3) * 0.05 });
            },
        });
    });



    // Next-Step 리스트 박스 ======================================================================
    gsap.utils.toArray('.Next-Step .listBox .box').forEach((selector) => {
        gsap.timeline({
            scrollTrigger: {
                trigger: selector,
                start: '0% 5%',
                end: '0% 0%',
                scrub: 1,
            }
        })
            .to(selector, { transform: 'rotateX(-5deg) scale(0.9)', transformOrigin: 'top', filter: 'brightness(0.3)' }, 0);
    });



    // qna ======================================================================
    gsap.timeline({
        scrollTrigger: {
            trigger: '#qna',
            start: '0% 100%',
            end: '100% 100%',
            scrub: 1,
        }
    })
        .to('.logoWrap', { top: '40%', ease: 'none', duration: 5 }, 0);

        
    // 땡큐폴 와칭 비디오랩  ======================================================================
    gsap.timeline({
        scrollTrigger: {
            trigger: '.footer h2',
            start: 'top bottom',
            end: '0% 0%',
            scrub: 1,
        }
    })
        .to('.footer h2', { x: () => window.innerWidth * -0.6, y: 0, z: 0, ease: 'none' }, 0);



    // 푸터 질문 문구 페이드 인업 ======================================================================
    const textAniList = document.querySelectorAll('.footer .textAni li');
    const textAni = gsap.timeline({ repeat: -1 });

    textAniList.forEach((li) => {
        textAni
            .to(li, { opacity: 1, duration: 0.8, ease: 'power4.out' })
            .to(li, { opacity: 1, duration: 2 })                       // 2초 유지
            .to(li, { opacity: 0, duration: 0.8, ease: 'power4.out' });
    });


    ScrollTrigger.refresh();
});


// about me 하단 로고 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Select all .nav-item elements
  const navItems = document.querySelectorAll('.nav-item');
  // Helper function to add/remove a class to a sibling at a given offset
  const toggleSiblingClass = (items, index, offset, className, add) => {
    const sibling = items[index + offset];
    if (sibling) {
      sibling.classList.toggle(className, add);
    }
  };
  // Event listeners to toggle classes on hover
  navItems.forEach((item, index) => {
    item.addEventListener('mouseenter', () => {
      item.classList.add('hover'); // Add .hover to current item
      // Toggle classes for siblings
      toggleSiblingClass(navItems, index, -1, 'sibling-close', true); // Previous sibling
      toggleSiblingClass(navItems, index, 1, 'sibling-close', true);  // Next sibling
      toggleSiblingClass(navItems, index, -2, 'sibling-far', true);   // Previous-previous sibling
      toggleSiblingClass(navItems, index, 2, 'sibling-far', true);    // Next-next sibling
    });
    item.addEventListener('mouseleave', () => {
      item.classList.remove('hover'); // Remove .hover from current item
      // Toggle classes for siblings
      toggleSiblingClass(navItems, index, -1, 'sibling-close', false); // Previous sibling
      toggleSiblingClass(navItems, index, 1, 'sibling-close', false);  // Next sibling
      toggleSiblingClass(navItems, index, -2, 'sibling-far', false);   // Previous-previous sibling
      toggleSiblingClass(navItems, index, 2, 'sibling-far', false);    // Next-next sibling
    });
  });
});

// 그래픽 디자인 이미지 트레일러 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
    const trailer = document.querySelector(".graphic-design .mainTextBox");
    const images = document.querySelectorAll(".graphic-design .image-gallery .image-item");

    if (!trailer || images.length === 0) return;  // 방어 코드: 요소가 없으면 중단

    let currentImageIndex = 0;
    let lastMousePos = { x: 0, y: 0 };
    let lastImageTime = Date.now();

    const movementThreshold = 180; // 마지막 이미지가 생성된 위치에서 최소 몇 px 이상 이동해야 새 이미지를 만들지
    const delayBetween = 100;

    function createImageTrail(e) {  // mainTextBox 기준 좌표로 변환
        const rect = trailer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;


        if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;  // 박스 내부일 때만 (안전장치)

        // 마지막 생성 좌표와 거리 계산 (mainTextBox 기준)
        const dx = x - lastMousePos.x;
        const dy = y - lastMousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < movementThreshold) return;

        const now = Date.now();
        if (now - lastImageTime < delayBetween) return;

        // 이미지 복제
        const image = images[currentImageIndex].cloneNode(true);
        currentImageIndex = (currentImageIndex + 1) % images.length;

        // absolute 기준점: mainTextBox (이미 position:relative라 OK)
        // 이미지 중앙 정렬(200x300 기준이면 -100, -150)
        image.style.left = `${x - 50}px`;
        image.style.top = `${y - 75}px`;

        trailer.appendChild(image);

        gsap.fromTo(
            image,
            {
                opacity: 1,
                scale: 0,
                rotation: gsap.utils.random(-20, 20)
            },
            {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                ease: "back.out(2)"
            }
        );

        gsap.to(image, {
            opacity: 1,
            scale: 0,
            duration: 0.6,
            delay: 0.6,
            ease: "power2.in",
            onComplete: () => image.remove()
        });

        lastMousePos = { x, y };
        lastImageTime = now;
    }

    // document가 아니라 mainTextBox에서만 동작
    trailer.addEventListener("mousemove", createImageTrail);

    // 박스 밖으로 나가면 기준점 리셋(선택)
    trailer.addEventListener("mouseleave", () => {
        lastMousePos = { x: 0, y: 0 };
    });
});




// 포물선 마퀴 ======================================================================
document.addEventListener('DOMContentLoaded', () => {
    // === 설정값 (React props/const 대체) ===
    const marqueeText = 'Designer ✦ Publisher ✦ Director ✦ ';
    const pathId = 'customCurve';
    const textSpacing = 3220; // px 단위 간격
    const speed = 1;          // 프레임당 이동 px (1 = 원본과 동일)

    const path = document.getElementById(pathId);
    const textPath = document.getElementById('marqueeTextPath');
    if (!path || !textPath) return;

    // 경로 길이 측정 (React useEffect 대체)
    const pathLength = path.getTotalLength();

    // 반복 개수 계산 (원본 로직 동일)
    const repeats = Math.ceil(pathLength / textSpacing) + 2;

    // tspans 참조 배열
    const tspans = [];

    // tspan 생성 (React 렌더 대체)
    for (let i = 0; i < repeats; i++) {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', String(i * textSpacing));
        tspan.textContent = marqueeText;
        tspan.style.fontFamily = '"Sequel 100 Wide", sans-serif';
        textPath.appendChild(tspan);
        tspans.push(tspan);
    }

    // 무한 애니메이션 (React useEffect 대체)
    let rafId;

    function move() {
        for (let i = 0; i < tspans.length; i++) {
            const tspan = tspans[i];
            let x = parseFloat(tspan.getAttribute('x')) || 0;
            x -= speed;

            // 너무 왼쪽으로 가면 오른쪽 끝으로 보내기
            if (x < -textSpacing) {
                x = (tspans.length - 1) * textSpacing;
            }

            tspan.setAttribute('x', String(x));
        }

        rafId = requestAnimationFrame(move);
    }

    move();

    // 페이지 떠날 때 정리(선택)
    window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId));
});



//====================================================================== Q n A ======================================================================
document.addEventListener('DOMContentLoaded', () => {
    let isAnimating = false;

    // 이벤트 위임: .qna-list 안에 li가 나중에 바뀌거나 추가돼도 동작
    $(document).on('mouseenter', '.qna-list .li', function () {
        if (isAnimating) return;

        isAnimating = true;

        const $current = $(this);
        const $all = $('.qna-list .li');

        // 현재 것만 active, 나머지는 inactive
        $all.not($current).removeClass('active').addClass('inactive');
        $current.removeClass('inactive').addClass('active');

        setTimeout(() => {
            isAnimating = false;
        }, 150);
    });
});



//====================================================================== matter.js ======================================================================

document.addEventListener('DOMContentLoaded', function () {
    //📌 Matter.js 기본 객체 생성
    let Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Mouse = Matter.Mouse,
        MouseConstraint = Matter.MouseConstraint;

    // 전역 변수 (한 번만 생성 후 재사용)
    let engine = Engine.create();
    let render;

    function init() {
        // 화면 크기 값 가져오기
        let width = $("#matter-container").width();
        let height = $("#matter-container").height();

        // 기존 엔진과 월드 초기화
        if (engine) {
            World.clear(engine.world);
            Engine.clear(engine);
        } else {
            engine = Engine.create();
        }

        engine.world.gravity.x = 0;
        engine.world.gravity.y = 0;

        // 기존 Render 객체 정리 후 새로운 Render 생성
        if (render) {
            Render.stop(render); // 기존 렌더링 중지
            render.canvas.remove(); // 기존 캔버스 삭제
            render.context = null;
            render.textures = {};
        }

        render = Render.create({
            element: document.getElementById('matter-container'),
            engine: engine,
            options: {
                wireframes: false,
                background: 'transparent',
                width: width,
                height: height
            }
        });

        // 월드 경계 추가 (바운더리)
        World.add(engine.world, [
            Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true }), // 하단 벽
            Bodies.rectangle(width / 2, -50, width, 100, { isStatic: true }), // 상단 벽
            Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true }), // 왼쪽 벽
            Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true }) // 오른쪽 벽
        ]);

        // <ul id="myList"> 내의 모든 <li> 요소 탐색
        let listItems = document.querySelectorAll("#myList li");
        let circles = [];

        listItems.forEach(li => {
            let img = li.querySelector("img");
            if (img) {
                // 이미지가 로드된 후에만 circle 생성 (naturalWidth 문제 해결)
                if (img.complete) {
                    createCircle(img);
                } else {
                    img.onload = function () {
                        createCircle(img);
                    };
                }
            }
        });

        // 이미지에서 Circle 객체 생성하는 함수
        function createCircle(img) {
            let texture = img.src;
            let radius = img.naturalWidth / 3; // 이미지 크기에 따라 반지름 조정

            let circle = Bodies.circle(
                Math.random() * width,  // 랜덤 X 위치
                Math.random() * height, // 랜덤 Y 위치
                radius,
                {
                    render: {
                        sprite: {
                            texture: texture,
                            xScale: 0.7,  // 가로 크기 축소 (70%)
                            yScale: 0.7   // 세로 크기 축소 (70%)
                        }
                    }
                }
            );

            circles.push(circle);
            World.add(engine.world, circle);
        }

        // Matter.js 엔진 및 렌더 실행
        Engine.run(engine);
        Render.run(render);

        // 마우스 인터랙션 추가 (드래그 기능)
        let mouse = Mouse.create(render.canvas);
        let mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.5,
                render: { visible: false }
            }
        });

        // 스크롤 막는 Matter.js 기본 wheel 이벤트 제거
        mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
        mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

        // (모바일까지 대비할 경우)
        mouse.element.removeEventListener("touchmove", mouse.mousemove);

        // 기존 마우스 컨트롤 제거 후 새로운 컨트롤 추가
        if (engine.mouseConstraint) {
            World.remove(engine.world, engine.mouseConstraint);
        }
        engine.mouseConstraint = mouseConstraint;
        World.add(engine.world, mouseConstraint);
        render.mouse = mouse;

        // 중앙으로 끌어당기는 힘 적용
        Matter.Events.on(engine, 'beforeUpdate', function () {
            circles.forEach(function (circle) {
                // 중앙으로 가는 힘 적용
                Matter.Body.applyForce(circle, circle.position, {
                    x: (width / 2 - circle.position.x) * 0.00005, //숫자가 작아질 수록 강해짐
                    y: (height / 2 - circle.position.y) * 0.00005  //숫자가 작아질 수록 강해짐
                });

                // 마우스와의 충돌 감지 (반발력 추가)
                let mousePosition = mouse.position;
                let distance = Matter.Vector.magnitude(Matter.Vector.sub(mousePosition, circle.position));
                let minDistance = circle.circleRadius + 10;

                if (distance < minDistance) {
                    let forceMagnitude = 0.05 * (minDistance - distance);  //숫자가 작아질 수록 강해짐
                    let force = Matter.Vector.normalise(Matter.Vector.sub(circle.position, mousePosition));
                    force = Matter.Vector.mult(force, forceMagnitude);
                    Matter.Body.applyForce(circle, circle.position, force);
                }
            });
        });
    }

    // 초기 실행
    init();

    // 창 크기 변경 시 `init()` 실행 (디바운싱 적용)
    let resizeTimer;
    $(window).resize(function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(init, 200);
    });
});




//====================================================================== video ======================================================================
$(function () {
    gsap.timeline({
        scrollTrigger: {
            trigger: '.video',
            start: '00% 90%',
            end: '80% 90%',
            scrub: 1,
            markers: false
        }
    })
        .fromTo('.videowrap video',
            { 'clip-path': 'inset(60% round 1000px)' },
            { 'clip-path': 'inset(0% round 30px)', ease: 'none', duration: 10 },
            0
        );
});


