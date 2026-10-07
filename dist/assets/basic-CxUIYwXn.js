import{n as T,a as U,r as W,c as N,i as G,o as D,b as $,U as ce,d as Hn,t as Kn,e as Gn,f as Qn,g as Jn,h as Yn}from"./index-C2r6kl6N.js";import{C as X,A as j,O as F,a as M,b as k,c as Pt,E as K,R as B,d as z,e as Ft,f as Xn,g as fe,H as Zn,h as ie,r as Z,i as Ce,T as qe,S as Ne,M as Tn,j as _n,k as In,l as ei,m as An,n as ti,o as ni,p as ii,W as Bt}from"./core-Dllqebwz.js";import{a as ee,b as O,w as Fe,A as Vt,i as ri}from"./walletconnect-CN6MBSCx.js";import{g as oi}from"./onchain-D9AOtLYB.js";import{r as si}from"./dijkstra-COg3n3zL.js";import"./supabase-C3NHck8P.js";/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ai(e){return T({...e,state:!0,attribute:!1})}var Ae=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let we=class extends G{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=X.state.connectors,this.count=j.state.count,this.filteredCount=j.state.filteredWallets.length,this.isFetchingRecommendedWallets=j.state.isFetchingRecommendedWallets,this.unsubscribe.push(X.subscribeKey("connectors",t=>this.connectors=t),j.subscribeKey("count",t=>this.count=t),j.subscribeKey("filteredWallets",t=>this.filteredCount=t.length),j.subscribeKey("isFetchingRecommendedWallets",t=>this.isFetchingRecommendedWallets=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){const t=this.connectors.find(c=>c.id==="walletConnect"),{allWallets:i}=F.state;if(!t||i==="HIDE"||i==="ONLY_MOBILE"&&!M.isMobile())return null;const r=j.state.featured.length,o=this.count+r,n=o<10?o:Math.floor(o/10)*10,s=this.filteredCount>0?this.filteredCount:n;let a=`${s}`;this.filteredCount>0?a=`${this.filteredCount}`:s<o&&(a=`${s}+`);const l=k.hasAnyConnection(Pt.CONNECTOR_ID.WALLET_CONNECT);return $`
      <wui-list-wallet
        name="Search Wallet"
        walletIcon="search"
        showAllWallets
        @click=${this.onAllWallets.bind(this)}
        tagLabel=${a}
        tagVariant="info"
        data-testid="all-wallets"
        tabIdx=${D(this.tabIdx)}
        .loading=${this.isFetchingRecommendedWallets}
        ?disabled=${l}
        size="sm"
      ></wui-list-wallet>
    `}onAllWallets(){K.sendEvent({type:"track",event:"CLICK_ALL_WALLETS"}),B.push("AllWallets",{redirectView:B.state.data?.redirectView})}};Ae([U()],we.prototype,"tabIdx",void 0);Ae([W()],we.prototype,"connectors",void 0);Ae([W()],we.prototype,"count",void 0);Ae([W()],we.prototype,"filteredCount",void 0);Ae([W()],we.prototype,"isFetchingRecommendedWallets",void 0);we=Ae([N("w3m-all-wallets-widget")],we);const li=z`
  :host {
    margin-top: ${({spacing:e})=>e[1]};
  }
  wui-separator {
    margin: ${({spacing:e})=>e[3]} calc(${({spacing:e})=>e[3]} * -1)
      ${({spacing:e})=>e[2]} calc(${({spacing:e})=>e[3]} * -1);
    width: calc(100% + ${({spacing:e})=>e[3]} * 2);
  }
`;var We=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let pe=class extends G{constructor(){super(),this.unsubscribe=[],this.explorerWallets=j.state.explorerWallets,this.connections=k.state.connections,this.connectorImages=Ft.state.connectorImages,this.loadingTelegram=!1,this.unsubscribe.push(k.subscribeKey("connections",t=>this.connections=t),Ft.subscribeKey("connectorImages",t=>this.connectorImages=t),j.subscribeKey("explorerFilteredWallets",t=>{this.explorerWallets=t?.length?t:j.state.explorerWallets}),j.subscribeKey("explorerWallets",t=>{this.explorerWallets?.length||(this.explorerWallets=t)})),M.isTelegram()&&M.isIos()&&(this.loadingTelegram=!k.state.wcUri,this.unsubscribe.push(k.subscribeKey("wcUri",t=>this.loadingTelegram=!t)))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){return $`
      <wui-flex flexDirection="column" gap="2"> ${this.connectorListTemplate()} </wui-flex>
    `}connectorListTemplate(){return Xn.connectorList().map((t,i)=>t.kind==="connector"?this.renderConnector(t,i):this.renderWallet(t,i))}getConnectorNamespaces(t){return t.subtype==="walletConnect"?[]:t.subtype==="multiChain"?t.connector.connectors?.map(i=>i.chain)||[]:[t.connector.chain]}renderConnector(t,i){const r=t.connector,o=fe.getConnectorImage(r)||this.connectorImages[r?.imageId??""],s=(this.connections.get(r.chain)??[]).some(x=>Zn.isLowerCaseMatch(x.connectorId,r.id));let a,l;t.subtype==="walletConnect"?(a="qr code",l="accent"):t.subtype==="injected"||t.subtype==="announced"?(a=s?"connected":"installed",l=s?"info":"success"):(a=void 0,l=void 0);const c=k.hasAnyConnection(Pt.CONNECTOR_ID.WALLET_CONNECT),p=t.subtype==="walletConnect"||t.subtype==="external"?c:!1;return $`
      <w3m-list-wallet
        displayIndex=${i}
        imageSrc=${D(o)}
        .installed=${!0}
        name=${r.name??"Unknown"}
        .tagVariant=${l}
        tagLabel=${D(a)}
        data-testid=${`wallet-selector-${r.id.toLowerCase()}`}
        size="sm"
        @click=${()=>this.onClickConnector(t)}
        tabIdx=${D(this.tabIdx)}
        ?disabled=${p}
        rdnsId=${D(r.explorerWallet?.rdns||void 0)}
        walletRank=${D(r.explorerWallet?.order)}
        .namespaces=${this.getConnectorNamespaces(t)}
      >
      </w3m-list-wallet>
    `}onClickConnector(t){const i=B.state.data?.redirectView;if(t.subtype==="walletConnect"){X.setActiveConnector(t.connector),M.isMobile()?B.push("AllWallets"):B.push("ConnectingWalletConnect",{redirectView:i});return}if(t.subtype==="multiChain"){X.setActiveConnector(t.connector),B.push("ConnectingMultiChain",{redirectView:i});return}if(t.subtype==="injected"){X.setActiveConnector(t.connector),B.push("ConnectingExternal",{connector:t.connector,redirectView:i,wallet:t.connector.explorerWallet});return}if(t.subtype==="announced"){if(t.connector.id==="walletConnect"){M.isMobile()?B.push("AllWallets"):B.push("ConnectingWalletConnect",{redirectView:i});return}B.push("ConnectingExternal",{connector:t.connector,redirectView:i,wallet:t.connector.explorerWallet});return}B.push("ConnectingExternal",{connector:t.connector,redirectView:i})}renderWallet(t,i){const r=t.wallet,o=fe.getWalletImage(r),s=k.hasAnyConnection(Pt.CONNECTOR_ID.WALLET_CONNECT),a=this.loadingTelegram,l=t.subtype==="recent"?"recent":void 0,c=t.subtype==="recent"?"info":void 0;return $`
      <w3m-list-wallet
        displayIndex=${i}
        imageSrc=${D(o)}
        name=${r.name??"Unknown"}
        @click=${()=>this.onClickWallet(t)}
        size="sm"
        data-testid=${`wallet-selector-${r.id}`}
        tabIdx=${D(this.tabIdx)}
        ?loading=${a}
        ?disabled=${s}
        rdnsId=${D(r.rdns||void 0)}
        walletRank=${D(r.order)}
        tagLabel=${D(l)}
        .tagVariant=${c}
      >
      </w3m-list-wallet>
    `}onClickWallet(t){const i=B.state.data?.redirectView,r=ie.state.activeChain;if(t.subtype==="featured"){X.selectWalletConnector(t.wallet);return}if(t.subtype==="recent"){if(this.loadingTelegram)return;X.selectWalletConnector(t.wallet);return}if(t.subtype==="custom"){if(this.loadingTelegram)return;B.push("ConnectingWalletConnect",{wallet:t.wallet,redirectView:i});return}if(this.loadingTelegram)return;const o=r?X.getConnector({id:t.wallet.id,namespace:r}):void 0;o?B.push("ConnectingExternal",{connector:o,redirectView:i}):B.push("ConnectingWalletConnect",{wallet:t.wallet,redirectView:i})}};pe.styles=li;We([U({type:Number})],pe.prototype,"tabIdx",void 0);We([W()],pe.prototype,"explorerWallets",void 0);We([W()],pe.prototype,"connections",void 0);We([W()],pe.prototype,"connectorImages",void 0);We([W()],pe.prototype,"loadingTelegram",void 0);pe=We([N("w3m-connector-list")],pe);const ci=z`
  :host {
    flex: 1;
    height: 100%;
  }

  button {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    column-gap: ${({spacing:e})=>e[1]};
    color: ${({tokens:e})=>e.theme.textSecondary};
    border-radius: ${({borderRadius:e})=>e[20]};
    background-color: transparent;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button[data-active='true'] {
    color: ${({tokens:e})=>e.theme.textPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundTertiary};
  }

  button:hover:enabled:not([data-active='true']),
  button:active:enabled:not([data-active='true']) {
    wui-text,
    wui-icon {
      color: ${({tokens:e})=>e.theme.textPrimary};
    }
  }
`;var Me=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};const ui={lg:"lg-regular",md:"md-regular",sm:"sm-regular"},di={lg:"md",md:"sm",sm:"sm"};let me=class extends ee{constructor(){super(...arguments),this.icon="mobile",this.size="md",this.label="",this.active=!1}render(){return O`
      <button data-active=${this.active}>
        ${this.icon?O`<wui-icon size=${di[this.size]} name=${this.icon}></wui-icon>`:""}
        <wui-text variant=${ui[this.size]}> ${this.label} </wui-text>
      </button>
    `}};me.styles=[Z,Ce,ci];Me([T()],me.prototype,"icon",void 0);Me([T()],me.prototype,"size",void 0);Me([T()],me.prototype,"label",void 0);Me([T({type:Boolean})],me.prototype,"active",void 0);me=Me([N("wui-tab-item")],me);const hi=z`
  :host {
    display: inline-flex;
    align-items: center;
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[32]};
    padding: ${({spacing:e})=>e["01"]};
    box-sizing: border-box;
  }

  :host([data-size='sm']) {
    height: 26px;
  }

  :host([data-size='md']) {
    height: 36px;
  }
`;var Oe=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let be=class extends ee{constructor(){super(...arguments),this.tabs=[],this.onTabChange=()=>null,this.size="md",this.activeTab=0}render(){return this.dataset.size=this.size,this.tabs.map((t,i)=>{const r=i===this.activeTab;return O`
        <wui-tab-item
          @click=${()=>this.onTabClick(i)}
          icon=${t.icon}
          size=${this.size}
          label=${t.label}
          ?active=${r}
          data-active=${r}
          data-testid="tab-${t.label?.toLowerCase()}"
        ></wui-tab-item>
      `})}onTabClick(t){this.activeTab=t,this.onTabChange(t)}};be.styles=[Z,Ce,hi];Oe([T({type:Array})],be.prototype,"tabs",void 0);Oe([T()],be.prototype,"onTabChange",void 0);Oe([T()],be.prototype,"size",void 0);Oe([ai()],be.prototype,"activeTab",void 0);be=Oe([N("wui-tabs")],be);var Lt=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let Ve=class extends G{constructor(){super(...arguments),this.platformTabs=[],this.unsubscribe=[],this.platforms=[],this.onSelectPlatfrom=void 0}disconnectCallback(){this.unsubscribe.forEach(t=>t())}render(){const t=this.generateTabs();return $`
      <wui-flex justifyContent="center" .padding=${["0","0","4","0"]}>
        <wui-tabs .tabs=${t} .onTabChange=${this.onTabChange.bind(this)}></wui-tabs>
      </wui-flex>
    `}generateTabs(){const t=this.platforms.map(i=>i==="browser"?{label:"Browser",icon:"extension",platform:"browser"}:i==="mobile"?{label:"Mobile",icon:"mobile",platform:"mobile"}:i==="qrcode"?{label:"Mobile",icon:"mobile",platform:"qrcode"}:i==="web"?{label:"Webapp",icon:"browser",platform:"web"}:i==="desktop"?{label:"Desktop",icon:"desktop",platform:"desktop"}:{label:"Browser",icon:"extension",platform:"unsupported"});return this.platformTabs=t.map(({platform:i})=>i),t}onTabChange(t){const i=this.platformTabs[t];i&&this.onSelectPlatfrom?.(i)}};Lt([U({type:Array})],Ve.prototype,"platforms",void 0);Lt([U()],Ve.prototype,"onSelectPlatfrom",void 0);Ve=Lt([N("w3m-connecting-header")],Ve);const fi=z`
  :host {
    display: block;
    width: 100px;
    height: 100px;
  }

  svg {
    width: 100px;
    height: 100px;
  }

  rect {
    fill: none;
    stroke: ${e=>e.colors.accent100};
    stroke-width: 3px;
    stroke-linecap: round;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0px;
    }
  }
`;var Wn=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let He=class extends ee{constructor(){super(...arguments),this.radius=36}render(){return this.svgLoaderTemplate()}svgLoaderTemplate(){const t=this.radius>50?50:this.radius,r=36-t,o=116+r,n=245+r,s=360+r*1.75;return O`
      <svg viewBox="0 0 110 110" width="110" height="110">
        <rect
          x="2"
          y="2"
          width="106"
          height="106"
          rx=${t}
          stroke-dasharray="${o} ${n}"
          stroke-dashoffset=${s}
        />
      </svg>
    `}};He.styles=[Z,fi];Wn([T({type:Number})],He.prototype,"radius",void 0);He=Wn([N("wui-loading-thumbnail")],He);const pi=z`
  wui-flex {
    width: 100%;
    height: 52px;
    box-sizing: border-box;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[5]};
    padding-left: ${({spacing:e})=>e[3]};
    padding-right: ${({spacing:e})=>e[3]};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:e})=>e[6]};
  }

  wui-text {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  wui-icon {
    width: 12px;
    height: 12px;
  }
`;var tt=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let _e=class extends ee{constructor(){super(...arguments),this.disabled=!1,this.label="",this.buttonLabel=""}render(){return O`
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="lg-regular" color="inherit">${this.label}</wui-text>
        <wui-button variant="accent-secondary" size="sm">
          ${this.buttonLabel}
          <wui-icon name="chevronRight" color="inherit" size="inherit" slot="iconRight"></wui-icon>
        </wui-button>
      </wui-flex>
    `}};_e.styles=[Z,Ce,pi];tt([T({type:Boolean})],_e.prototype,"disabled",void 0);tt([T()],_e.prototype,"label",void 0);tt([T()],_e.prototype,"buttonLabel",void 0);_e=tt([N("wui-cta-button")],_e);const gi=z`
  :host {
    display: block;
    padding: 0 ${({spacing:e})=>e[5]} ${({spacing:e})=>e[5]};
  }
`;var Pn=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let Ke=class extends G{constructor(){super(...arguments),this.wallet=void 0}render(){if(!this.wallet)return this.style.display="none",null;const{name:t,app_store:i,play_store:r,chrome_store:o,homepage:n}=this.wallet,s=M.isMobile(),a=M.isIos(),l=M.isAndroid(),c=[i,r,n,o].filter(Boolean).length>1,p=ce.getTruncateString({string:t,charsStart:12,charsEnd:0,truncate:"end"});return c&&!s?$`
        <wui-cta-button
          label=${`Don't have ${p}?`}
          buttonLabel="Get"
          @click=${()=>B.push("Downloads",{wallet:this.wallet})}
        ></wui-cta-button>
      `:!c&&n?$`
        <wui-cta-button
          label=${`Don't have ${p}?`}
          buttonLabel="Get"
          @click=${this.onHomePage.bind(this)}
        ></wui-cta-button>
      `:i&&a?$`
        <wui-cta-button
          label=${`Don't have ${p}?`}
          buttonLabel="Get"
          @click=${this.onAppStore.bind(this)}
        ></wui-cta-button>
      `:r&&l?$`
        <wui-cta-button
          label=${`Don't have ${p}?`}
          buttonLabel="Get"
          @click=${this.onPlayStore.bind(this)}
        ></wui-cta-button>
      `:(this.style.display="none",null)}onAppStore(){this.wallet?.app_store&&M.openHref(this.wallet.app_store,"_blank")}onPlayStore(){this.wallet?.play_store&&M.openHref(this.wallet.play_store,"_blank")}onHomePage(){this.wallet?.homepage&&M.openHref(this.wallet.homepage,"_blank")}};Ke.styles=[gi];Pn([U({type:Object})],Ke.prototype,"wallet",void 0);Ke=Pn([N("w3m-mobile-download-links")],Ke);const wi=z`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-wallet-image {
    width: 56px;
    height: 56px;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:e})=>e[1]} * -1);
    bottom: calc(${({spacing:e})=>e[1]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition-property: opacity, transform;
    transition-duration: ${({durations:e})=>e.lg};
    transition-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px ${({spacing:e})=>e[4]};
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms ${({easings:e})=>e["ease-out-power-2"]} both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  w3m-mobile-download-links {
    padding: 0px;
    width: 100%;
  }
`;var te=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};class q extends G{constructor(){super(),this.wallet=B.state.data?.wallet,this.connector=B.state.data?.connector,this.timeout=void 0,this.secondaryBtnIcon="refresh",this.onConnect=void 0,this.onRender=void 0,this.onAutoConnect=void 0,this.isWalletConnect=!0,this.unsubscribe=[],this.imageSrc=fe.getConnectorImage(this.connector)??fe.getWalletImage(this.wallet),this.name=this.wallet?.name??this.connector?.name??"Wallet",this.isRetrying=!1,this.uri=k.state.wcUri,this.error=k.state.wcError,this.ready=!1,this.showRetry=!1,this.label=void 0,this.secondaryBtnLabel="Try again",this.secondaryLabel="Accept connection request in the wallet",this.isLoading=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(k.subscribeKey("wcUri",t=>{this.uri=t,this.isRetrying&&this.onRetry&&(this.isRetrying=!1,this.onConnect?.())}),k.subscribeKey("wcError",t=>this.error=t)),(M.isTelegram()||M.isSafari())&&M.isIos()&&k.state.wcUri&&this.onConnect?.()}firstUpdated(){this.onAutoConnect?.(),this.showRetry=!this.onAutoConnect}disconnectedCallback(){this.unsubscribe.forEach(t=>t()),k.setWcError(!1),clearTimeout(this.timeout)}render(){this.onRender?.(),this.onShowRetry();const t=this.error?"Connection can be declined if a previous request is still active":this.secondaryLabel;let i="";return this.label?i=this.label:(i=`Continue in ${this.name}`,this.error&&(i="Connection declined")),$`
      <wui-flex
        data-error=${D(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="6"
      >
        <wui-flex gap="2" justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${D(this.imageSrc)}></wui-wallet-image>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            color="error"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="6"> <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${["2","0","0","0"]}
        >
          <wui-text align="center" variant="lg-medium" color=${this.error?"error":"primary"}>
            ${i}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary">${t}</wui-text>
        </wui-flex>

        ${this.secondaryBtnLabel?$`
                <wui-button
                  variant="neutral-secondary"
                  size="md"
                  ?disabled=${this.isRetrying||this.isLoading}
                  @click=${this.onTryAgain.bind(this)}
                  data-testid="w3m-connecting-widget-secondary-button"
                >
                  <wui-icon
                    color="inherit"
                    slot="iconLeft"
                    name=${this.secondaryBtnIcon}
                  ></wui-icon>
                  ${this.secondaryBtnLabel}
                </wui-button>
              `:null}
      </wui-flex>

      ${this.isWalletConnect?$`
              <wui-flex .padding=${["0","5","5","5"]} justifyContent="center">
                <wui-link
                  @click=${this.onCopyUri}
                  variant="secondary"
                  icon="copy"
                  data-testid="wui-link-copy"
                >
                  Copy link
                </wui-link>
              </wui-flex>
            `:null}

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links></wui-flex>
      </wui-flex>
    `}onShowRetry(){this.error&&!this.showRetry&&(this.showRetry=!0,this.shadowRoot?.querySelector("wui-button")?.animate([{opacity:0},{opacity:1}],{fill:"forwards",easing:"ease"}))}onTryAgain(){k.setWcError(!1),this.onRetry?(this.isRetrying=!0,this.onRetry?.()):this.onConnect?.()}loaderTemplate(){const t=qe.state.themeVariables["--w3m-border-radius-master"],i=t?parseInt(t.replace("px",""),10):4;return $`<wui-loading-thumbnail radius=${i*9}></wui-loading-thumbnail>`}onCopyUri(){try{this.uri&&(M.copyToClopboard(this.uri),Ne.showSuccess("Link copied"))}catch{Ne.showError("Failed to copy")}}}q.styles=wi;te([W()],q.prototype,"isRetrying",void 0);te([W()],q.prototype,"uri",void 0);te([W()],q.prototype,"error",void 0);te([W()],q.prototype,"ready",void 0);te([W()],q.prototype,"showRetry",void 0);te([W()],q.prototype,"label",void 0);te([W()],q.prototype,"secondaryBtnLabel",void 0);te([W()],q.prototype,"secondaryLabel",void 0);te([W()],q.prototype,"isLoading",void 0);te([U({type:Boolean})],q.prototype,"isMobile",void 0);te([U()],q.prototype,"onRetry",void 0);var mi=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let Ht=class extends q{constructor(){if(super(),!this.wallet)throw new Error("w3m-connecting-wc-browser: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),K.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:B.state.view}})}async onConnectProxy(){try{this.error=!1;const{connectors:t}=X.state,i=t.find(r=>r.type==="ANNOUNCED"&&r.info?.rdns===this.wallet?.rdns||r.type==="INJECTED"||r.name===this.wallet?.name);if(i)await k.connectExternal(i,i.chain);else throw new Error("w3m-connecting-wc-browser: No connector found");Tn.close()}catch(t){t instanceof _n&&t.originalName===In.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?K.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:t.message}}):K.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:t?.message??"Unknown"}}),this.error=!0}}};Ht=mi([N("w3m-connecting-wc-browser")],Ht);var bi=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let Kt=class extends q{constructor(){if(super(),!this.wallet)throw new Error("w3m-connecting-wc-desktop: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onRender=this.onRenderProxy.bind(this),K.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"desktop",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:B.state.view}})}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onConnectProxy(){if(this.wallet?.desktop_link&&this.uri)try{this.error=!1;const{desktop_link:t,name:i}=this.wallet,{redirect:r,href:o}=M.formatNativeUrl(t,this.uri);k.setWcLinking({name:i,href:o}),k.setRecentWallet(this.wallet),M.openHref(r,"_blank")}catch{this.error=!0}}};Kt=bi([N("w3m-connecting-wc-desktop")],Kt);var Pe=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let ye=class extends q{constructor(){if(super(),this.btnLabelTimeout=void 0,this.redirectDeeplink=void 0,this.redirectUniversalLink=void 0,this.target=void 0,this.preferUniversalLinks=F.state.experimental_preferUniversalLinks,this.isLoading=!0,this.onConnect=()=>{ei.onConnectMobile(this.wallet)},!this.wallet)throw new Error("w3m-connecting-wc-mobile: No wallet provided");this.secondaryBtnLabel="Open",this.secondaryLabel=An.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.onHandleURI(),this.unsubscribe.push(k.subscribeKey("wcUri",()=>{this.onHandleURI()})),K.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"mobile",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:B.state.view}})}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.btnLabelTimeout)}onHandleURI(){this.isLoading=!this.uri,!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onTryAgain(){k.setWcError(!1),this.onConnect?.()}};Pe([W()],ye.prototype,"redirectDeeplink",void 0);Pe([W()],ye.prototype,"redirectUniversalLink",void 0);Pe([W()],ye.prototype,"target",void 0);Pe([W()],ye.prototype,"preferUniversalLinks",void 0);Pe([W()],ye.prototype,"isLoading",void 0);ye=Pe([N("w3m-connecting-wc-mobile")],ye);var Te={},at,Gt;function yi(){return Gt||(Gt=1,at=function(){return typeof Promise=="function"&&Promise.prototype&&Promise.prototype.then}),at}var lt={},he={},Qt;function xe(){if(Qt)return he;Qt=1;let e;const t=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];return he.getSymbolSize=function(r){if(!r)throw new Error('"version" cannot be null or undefined');if(r<1||r>40)throw new Error('"version" should be in range from 1 to 40');return r*4+17},he.getSymbolTotalCodewords=function(r){return t[r]},he.getBCHDigit=function(i){let r=0;for(;i!==0;)r++,i>>>=1;return r},he.setToSJISFunction=function(r){if(typeof r!="function")throw new Error('"toSJISFunc" is not a valid function.');e=r},he.isKanjiModeEnabled=function(){return typeof e<"u"},he.toSJIS=function(r){return e(r)},he}var ct={},Jt;function Nt(){return Jt||(Jt=1,(function(e){e.L={bit:1},e.M={bit:0},e.Q={bit:3},e.H={bit:2};function t(i){if(typeof i!="string")throw new Error("Param is not a string");switch(i.toLowerCase()){case"l":case"low":return e.L;case"m":case"medium":return e.M;case"q":case"quartile":return e.Q;case"h":case"high":return e.H;default:throw new Error("Unknown EC Level: "+i)}}e.isValid=function(r){return r&&typeof r.bit<"u"&&r.bit>=0&&r.bit<4},e.from=function(r,o){if(e.isValid(r))return r;try{return t(r)}catch{return o}}})(ct)),ct}var ut,Yt;function $i(){if(Yt)return ut;Yt=1;function e(){this.buffer=[],this.length=0}return e.prototype={get:function(t){const i=Math.floor(t/8);return(this.buffer[i]>>>7-t%8&1)===1},put:function(t,i){for(let r=0;r<i;r++)this.putBit((t>>>i-r-1&1)===1)},getLengthInBits:function(){return this.length},putBit:function(t){const i=Math.floor(this.length/8);this.buffer.length<=i&&this.buffer.push(0),t&&(this.buffer[i]|=128>>>this.length%8),this.length++}},ut=e,ut}var dt,Xt;function vi(){if(Xt)return dt;Xt=1;function e(t){if(!t||t<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=t,this.data=new Uint8Array(t*t),this.reservedBit=new Uint8Array(t*t)}return e.prototype.set=function(t,i,r,o){const n=t*this.size+i;this.data[n]=r,o&&(this.reservedBit[n]=!0)},e.prototype.get=function(t,i){return this.data[t*this.size+i]},e.prototype.xor=function(t,i,r){this.data[t*this.size+i]^=r},e.prototype.isReserved=function(t,i){return this.reservedBit[t*this.size+i]},dt=e,dt}var ht={},Zt;function Ci(){return Zt||(Zt=1,(function(e){const t=xe().getSymbolSize;e.getRowColCoords=function(r){if(r===1)return[];const o=Math.floor(r/7)+2,n=t(r),s=n===145?26:Math.ceil((n-13)/(2*o-2))*2,a=[n-7];for(let l=1;l<o-1;l++)a[l]=a[l-1]-s;return a.push(6),a.reverse()},e.getPositions=function(r){const o=[],n=e.getRowColCoords(r),s=n.length;for(let a=0;a<s;a++)for(let l=0;l<s;l++)a===0&&l===0||a===0&&l===s-1||a===s-1&&l===0||o.push([n[a],n[l]]);return o}})(ht)),ht}var ft={},en;function xi(){if(en)return ft;en=1;const e=xe().getSymbolSize,t=7;return ft.getPositions=function(r){const o=e(r);return[[0,0],[o-t,0],[0,o-t]]},ft}var pt={},tn;function Ei(){return tn||(tn=1,(function(e){e.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};const t={N1:3,N2:3,N3:40,N4:10};e.isValid=function(o){return o!=null&&o!==""&&!isNaN(o)&&o>=0&&o<=7},e.from=function(o){return e.isValid(o)?parseInt(o,10):void 0},e.getPenaltyN1=function(o){const n=o.size;let s=0,a=0,l=0,c=null,p=null;for(let x=0;x<n;x++){a=l=0,c=p=null;for(let y=0;y<n;y++){let h=o.get(x,y);h===c?a++:(a>=5&&(s+=t.N1+(a-5)),c=h,a=1),h=o.get(y,x),h===p?l++:(l>=5&&(s+=t.N1+(l-5)),p=h,l=1)}a>=5&&(s+=t.N1+(a-5)),l>=5&&(s+=t.N1+(l-5))}return s},e.getPenaltyN2=function(o){const n=o.size;let s=0;for(let a=0;a<n-1;a++)for(let l=0;l<n-1;l++){const c=o.get(a,l)+o.get(a,l+1)+o.get(a+1,l)+o.get(a+1,l+1);(c===4||c===0)&&s++}return s*t.N2},e.getPenaltyN3=function(o){const n=o.size;let s=0,a=0,l=0;for(let c=0;c<n;c++){a=l=0;for(let p=0;p<n;p++)a=a<<1&2047|o.get(c,p),p>=10&&(a===1488||a===93)&&s++,l=l<<1&2047|o.get(p,c),p>=10&&(l===1488||l===93)&&s++}return s*t.N3},e.getPenaltyN4=function(o){let n=0;const s=o.data.length;for(let l=0;l<s;l++)n+=o.data[l];return Math.abs(Math.ceil(n*100/s/5)-10)*t.N4};function i(r,o,n){switch(r){case e.Patterns.PATTERN000:return(o+n)%2===0;case e.Patterns.PATTERN001:return o%2===0;case e.Patterns.PATTERN010:return n%3===0;case e.Patterns.PATTERN011:return(o+n)%3===0;case e.Patterns.PATTERN100:return(Math.floor(o/2)+Math.floor(n/3))%2===0;case e.Patterns.PATTERN101:return o*n%2+o*n%3===0;case e.Patterns.PATTERN110:return(o*n%2+o*n%3)%2===0;case e.Patterns.PATTERN111:return(o*n%3+(o+n)%2)%2===0;default:throw new Error("bad maskPattern:"+r)}}e.applyMask=function(o,n){const s=n.size;for(let a=0;a<s;a++)for(let l=0;l<s;l++)n.isReserved(l,a)||n.xor(l,a,i(o,l,a))},e.getBestMask=function(o,n){const s=Object.keys(e.Patterns).length;let a=0,l=1/0;for(let c=0;c<s;c++){n(c),e.applyMask(c,o);const p=e.getPenaltyN1(o)+e.getPenaltyN2(o)+e.getPenaltyN3(o)+e.getPenaltyN4(o);e.applyMask(c,o),p<l&&(l=p,a=c)}return a}})(pt)),pt}var ze={},nn;function Bn(){if(nn)return ze;nn=1;const e=Nt(),t=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],i=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];return ze.getBlocksCount=function(o,n){switch(n){case e.L:return t[(o-1)*4+0];case e.M:return t[(o-1)*4+1];case e.Q:return t[(o-1)*4+2];case e.H:return t[(o-1)*4+3];default:return}},ze.getTotalCodewordsCount=function(o,n){switch(n){case e.L:return i[(o-1)*4+0];case e.M:return i[(o-1)*4+1];case e.Q:return i[(o-1)*4+2];case e.H:return i[(o-1)*4+3];default:return}},ze}var gt={},ke={},rn;function Ri(){if(rn)return ke;rn=1;const e=new Uint8Array(512),t=new Uint8Array(256);return(function(){let r=1;for(let o=0;o<255;o++)e[o]=r,t[r]=o,r<<=1,r&256&&(r^=285);for(let o=255;o<512;o++)e[o]=e[o-255]})(),ke.log=function(r){if(r<1)throw new Error("log("+r+")");return t[r]},ke.exp=function(r){return e[r]},ke.mul=function(r,o){return r===0||o===0?0:e[t[r]+t[o]]},ke}var on;function Si(){return on||(on=1,(function(e){const t=Ri();e.mul=function(r,o){const n=new Uint8Array(r.length+o.length-1);for(let s=0;s<r.length;s++)for(let a=0;a<o.length;a++)n[s+a]^=t.mul(r[s],o[a]);return n},e.mod=function(r,o){let n=new Uint8Array(r);for(;n.length-o.length>=0;){const s=n[0];for(let l=0;l<o.length;l++)n[l]^=t.mul(o[l],s);let a=0;for(;a<n.length&&n[a]===0;)a++;n=n.slice(a)}return n},e.generateECPolynomial=function(r){let o=new Uint8Array([1]);for(let n=0;n<r;n++)o=e.mul(o,new Uint8Array([1,t.exp(n)]));return o}})(gt)),gt}var wt,sn;function Ti(){if(sn)return wt;sn=1;const e=Si();function t(i){this.genPoly=void 0,this.degree=i,this.degree&&this.initialize(this.degree)}return t.prototype.initialize=function(r){this.degree=r,this.genPoly=e.generateECPolynomial(this.degree)},t.prototype.encode=function(r){if(!this.genPoly)throw new Error("Encoder not initialized");const o=new Uint8Array(r.length+this.degree);o.set(r);const n=e.mod(o,this.genPoly),s=this.degree-n.length;if(s>0){const a=new Uint8Array(this.degree);return a.set(n,s),a}return n},wt=t,wt}var mt={},bt={},yt={},an;function kn(){return an||(an=1,yt.isValid=function(t){return!isNaN(t)&&t>=1&&t<=40}),yt}var ne={},ln;function Ln(){if(ln)return ne;ln=1;const e="[0-9]+",t="[A-Z $%*+\\-./:]+";let i="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";i=i.replace(/u/g,"\\u");const r="(?:(?![A-Z0-9 $%*+\\-./:]|"+i+`)(?:.|[\r
]))+`;ne.KANJI=new RegExp(i,"g"),ne.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g"),ne.BYTE=new RegExp(r,"g"),ne.NUMERIC=new RegExp(e,"g"),ne.ALPHANUMERIC=new RegExp(t,"g");const o=new RegExp("^"+i+"$"),n=new RegExp("^"+e+"$"),s=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");return ne.testKanji=function(l){return o.test(l)},ne.testNumeric=function(l){return n.test(l)},ne.testAlphanumeric=function(l){return s.test(l)},ne}var cn;function Ee(){return cn||(cn=1,(function(e){const t=kn(),i=Ln();e.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},e.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},e.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},e.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},e.MIXED={bit:-1},e.getCharCountIndicator=function(n,s){if(!n.ccBits)throw new Error("Invalid mode: "+n);if(!t.isValid(s))throw new Error("Invalid version: "+s);return s>=1&&s<10?n.ccBits[0]:s<27?n.ccBits[1]:n.ccBits[2]},e.getBestModeForData=function(n){return i.testNumeric(n)?e.NUMERIC:i.testAlphanumeric(n)?e.ALPHANUMERIC:i.testKanji(n)?e.KANJI:e.BYTE},e.toString=function(n){if(n&&n.id)return n.id;throw new Error("Invalid mode")},e.isValid=function(n){return n&&n.bit&&n.ccBits};function r(o){if(typeof o!="string")throw new Error("Param is not a string");switch(o.toLowerCase()){case"numeric":return e.NUMERIC;case"alphanumeric":return e.ALPHANUMERIC;case"kanji":return e.KANJI;case"byte":return e.BYTE;default:throw new Error("Unknown mode: "+o)}}e.from=function(n,s){if(e.isValid(n))return n;try{return r(n)}catch{return s}}})(bt)),bt}var un;function _i(){return un||(un=1,(function(e){const t=xe(),i=Bn(),r=Nt(),o=Ee(),n=kn(),s=7973,a=t.getBCHDigit(s);function l(y,h,A){for(let g=1;g<=40;g++)if(h<=e.getCapacity(g,A,y))return g}function c(y,h){return o.getCharCountIndicator(y,h)+4}function p(y,h){let A=0;return y.forEach(function(g){const _=c(g.mode,h);A+=_+g.getBitsLength()}),A}function x(y,h){for(let A=1;A<=40;A++)if(p(y,A)<=e.getCapacity(A,h,o.MIXED))return A}e.from=function(h,A){return n.isValid(h)?parseInt(h,10):A},e.getCapacity=function(h,A,g){if(!n.isValid(h))throw new Error("Invalid QR Code version");typeof g>"u"&&(g=o.BYTE);const _=t.getSymbolTotalCodewords(h),w=i.getTotalCodewordsCount(h,A),d=(_-w)*8;if(g===o.MIXED)return d;const f=d-c(g,h);switch(g){case o.NUMERIC:return Math.floor(f/10*3);case o.ALPHANUMERIC:return Math.floor(f/11*2);case o.KANJI:return Math.floor(f/13);case o.BYTE:default:return Math.floor(f/8)}},e.getBestVersionForData=function(h,A){let g;const _=r.from(A,r.M);if(Array.isArray(h)){if(h.length>1)return x(h,_);if(h.length===0)return 1;g=h[0]}else g=h;return l(g.mode,g.getLength(),_)},e.getEncodedBits=function(h){if(!n.isValid(h)||h<7)throw new Error("Invalid QR Code version");let A=h<<12;for(;t.getBCHDigit(A)-a>=0;)A^=s<<t.getBCHDigit(A)-a;return h<<12|A}})(mt)),mt}var $t={},dn;function Ii(){if(dn)return $t;dn=1;const e=xe(),t=1335,i=21522,r=e.getBCHDigit(t);return $t.getEncodedBits=function(n,s){const a=n.bit<<3|s;let l=a<<10;for(;e.getBCHDigit(l)-r>=0;)l^=t<<e.getBCHDigit(l)-r;return(a<<10|l)^i},$t}var vt={},Ct,hn;function Ai(){if(hn)return Ct;hn=1;const e=Ee();function t(i){this.mode=e.NUMERIC,this.data=i.toString()}return t.getBitsLength=function(r){return 10*Math.floor(r/3)+(r%3?r%3*3+1:0)},t.prototype.getLength=function(){return this.data.length},t.prototype.getBitsLength=function(){return t.getBitsLength(this.data.length)},t.prototype.write=function(r){let o,n,s;for(o=0;o+3<=this.data.length;o+=3)n=this.data.substr(o,3),s=parseInt(n,10),r.put(s,10);const a=this.data.length-o;a>0&&(n=this.data.substr(o),s=parseInt(n,10),r.put(s,a*3+1))},Ct=t,Ct}var xt,fn;function Wi(){if(fn)return xt;fn=1;const e=Ee(),t=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function i(r){this.mode=e.ALPHANUMERIC,this.data=r}return i.getBitsLength=function(o){return 11*Math.floor(o/2)+6*(o%2)},i.prototype.getLength=function(){return this.data.length},i.prototype.getBitsLength=function(){return i.getBitsLength(this.data.length)},i.prototype.write=function(o){let n;for(n=0;n+2<=this.data.length;n+=2){let s=t.indexOf(this.data[n])*45;s+=t.indexOf(this.data[n+1]),o.put(s,11)}this.data.length%2&&o.put(t.indexOf(this.data[n]),6)},xt=i,xt}var Et,pn;function Pi(){return pn||(pn=1,Et=function(t){for(var i=[],r=t.length,o=0;o<r;o++){var n=t.charCodeAt(o);if(n>=55296&&n<=56319&&r>o+1){var s=t.charCodeAt(o+1);s>=56320&&s<=57343&&(n=(n-55296)*1024+s-56320+65536,o+=1)}if(n<128){i.push(n);continue}if(n<2048){i.push(n>>6|192),i.push(n&63|128);continue}if(n<55296||n>=57344&&n<65536){i.push(n>>12|224),i.push(n>>6&63|128),i.push(n&63|128);continue}if(n>=65536&&n<=1114111){i.push(n>>18|240),i.push(n>>12&63|128),i.push(n>>6&63|128),i.push(n&63|128);continue}i.push(239,191,189)}return new Uint8Array(i).buffer}),Et}var Rt,gn;function Bi(){if(gn)return Rt;gn=1;const e=Pi(),t=Ee();function i(r){this.mode=t.BYTE,typeof r=="string"&&(r=e(r)),this.data=new Uint8Array(r)}return i.getBitsLength=function(o){return o*8},i.prototype.getLength=function(){return this.data.length},i.prototype.getBitsLength=function(){return i.getBitsLength(this.data.length)},i.prototype.write=function(r){for(let o=0,n=this.data.length;o<n;o++)r.put(this.data[o],8)},Rt=i,Rt}var St,wn;function ki(){if(wn)return St;wn=1;const e=Ee(),t=xe();function i(r){this.mode=e.KANJI,this.data=r}return i.getBitsLength=function(o){return o*13},i.prototype.getLength=function(){return this.data.length},i.prototype.getBitsLength=function(){return i.getBitsLength(this.data.length)},i.prototype.write=function(r){let o;for(o=0;o<this.data.length;o++){let n=t.toSJIS(this.data[o]);if(n>=33088&&n<=40956)n-=33088;else if(n>=57408&&n<=60351)n-=49472;else throw new Error("Invalid SJIS character: "+this.data[o]+`
Make sure your charset is UTF-8`);n=(n>>>8&255)*192+(n&255),r.put(n,13)}},St=i,St}var mn;function Li(){return mn||(mn=1,(function(e){const t=Ee(),i=Ai(),r=Wi(),o=Bi(),n=ki(),s=Ln(),a=xe(),l=si();function c(w){return unescape(encodeURIComponent(w)).length}function p(w,d,f){const u=[];let L;for(;(L=w.exec(f))!==null;)u.push({data:L[0],index:L.index,mode:d,length:L[0].length});return u}function x(w){const d=p(s.NUMERIC,t.NUMERIC,w),f=p(s.ALPHANUMERIC,t.ALPHANUMERIC,w);let u,L;return a.isKanjiModeEnabled()?(u=p(s.BYTE,t.BYTE,w),L=p(s.KANJI,t.KANJI,w)):(u=p(s.BYTE_KANJI,t.BYTE,w),L=[]),d.concat(f,u,L).sort(function(R,E){return R.index-E.index}).map(function(R){return{data:R.data,mode:R.mode,length:R.length}})}function y(w,d){switch(d){case t.NUMERIC:return i.getBitsLength(w);case t.ALPHANUMERIC:return r.getBitsLength(w);case t.KANJI:return n.getBitsLength(w);case t.BYTE:return o.getBitsLength(w)}}function h(w){return w.reduce(function(d,f){const u=d.length-1>=0?d[d.length-1]:null;return u&&u.mode===f.mode?(d[d.length-1].data+=f.data,d):(d.push(f),d)},[])}function A(w){const d=[];for(let f=0;f<w.length;f++){const u=w[f];switch(u.mode){case t.NUMERIC:d.push([u,{data:u.data,mode:t.ALPHANUMERIC,length:u.length},{data:u.data,mode:t.BYTE,length:u.length}]);break;case t.ALPHANUMERIC:d.push([u,{data:u.data,mode:t.BYTE,length:u.length}]);break;case t.KANJI:d.push([u,{data:u.data,mode:t.BYTE,length:c(u.data)}]);break;case t.BYTE:d.push([{data:u.data,mode:t.BYTE,length:c(u.data)}])}}return d}function g(w,d){const f={},u={start:{}};let L=["start"];for(let b=0;b<w.length;b++){const R=w[b],E=[];for(let m=0;m<R.length;m++){const I=R[m],v=""+b+m;E.push(v),f[v]={node:I,lastCount:0},u[v]={};for(let S=0;S<L.length;S++){const C=L[S];f[C]&&f[C].node.mode===I.mode?(u[C][v]=y(f[C].lastCount+I.length,I.mode)-y(f[C].lastCount,I.mode),f[C].lastCount+=I.length):(f[C]&&(f[C].lastCount=I.length),u[C][v]=y(I.length,I.mode)+4+t.getCharCountIndicator(I.mode,d))}}L=E}for(let b=0;b<L.length;b++)u[L[b]].end=0;return{map:u,table:f}}function _(w,d){let f;const u=t.getBestModeForData(w);if(f=t.from(d,u),f!==t.BYTE&&f.bit<u.bit)throw new Error('"'+w+'" cannot be encoded with mode '+t.toString(f)+`.
 Suggested mode is: `+t.toString(u));switch(f===t.KANJI&&!a.isKanjiModeEnabled()&&(f=t.BYTE),f){case t.NUMERIC:return new i(w);case t.ALPHANUMERIC:return new r(w);case t.KANJI:return new n(w);case t.BYTE:return new o(w)}}e.fromArray=function(d){return d.reduce(function(f,u){return typeof u=="string"?f.push(_(u,null)):u.data&&f.push(_(u.data,u.mode)),f},[])},e.fromString=function(d,f){const u=x(d,a.isKanjiModeEnabled()),L=A(u),b=g(L,f),R=l.find_path(b.map,"start","end"),E=[];for(let m=1;m<R.length-1;m++)E.push(b.table[R[m]].node);return e.fromArray(h(E))},e.rawSplit=function(d){return e.fromArray(x(d,a.isKanjiModeEnabled()))}})(vt)),vt}var bn;function Ni(){if(bn)return lt;bn=1;const e=xe(),t=Nt(),i=$i(),r=vi(),o=Ci(),n=xi(),s=Ei(),a=Bn(),l=Ti(),c=_i(),p=Ii(),x=Ee(),y=Li();function h(b,R){const E=b.size,m=n.getPositions(R);for(let I=0;I<m.length;I++){const v=m[I][0],S=m[I][1];for(let C=-1;C<=7;C++)if(!(v+C<=-1||E<=v+C))for(let P=-1;P<=7;P++)S+P<=-1||E<=S+P||(C>=0&&C<=6&&(P===0||P===6)||P>=0&&P<=6&&(C===0||C===6)||C>=2&&C<=4&&P>=2&&P<=4?b.set(v+C,S+P,!0,!0):b.set(v+C,S+P,!1,!0))}}function A(b){const R=b.size;for(let E=8;E<R-8;E++){const m=E%2===0;b.set(E,6,m,!0),b.set(6,E,m,!0)}}function g(b,R){const E=o.getPositions(R);for(let m=0;m<E.length;m++){const I=E[m][0],v=E[m][1];for(let S=-2;S<=2;S++)for(let C=-2;C<=2;C++)S===-2||S===2||C===-2||C===2||S===0&&C===0?b.set(I+S,v+C,!0,!0):b.set(I+S,v+C,!1,!0)}}function _(b,R){const E=b.size,m=c.getEncodedBits(R);let I,v,S;for(let C=0;C<18;C++)I=Math.floor(C/3),v=C%3+E-8-3,S=(m>>C&1)===1,b.set(I,v,S,!0),b.set(v,I,S,!0)}function w(b,R,E){const m=b.size,I=p.getEncodedBits(R,E);let v,S;for(v=0;v<15;v++)S=(I>>v&1)===1,v<6?b.set(v,8,S,!0):v<8?b.set(v+1,8,S,!0):b.set(m-15+v,8,S,!0),v<8?b.set(8,m-v-1,S,!0):v<9?b.set(8,15-v-1+1,S,!0):b.set(8,15-v-1,S,!0);b.set(m-8,8,1,!0)}function d(b,R){const E=b.size;let m=-1,I=E-1,v=7,S=0;for(let C=E-1;C>0;C-=2)for(C===6&&C--;;){for(let P=0;P<2;P++)if(!b.isReserved(I,C-P)){let de=!1;S<R.length&&(de=(R[S]>>>v&1)===1),b.set(I,C-P,de),v--,v===-1&&(S++,v=7)}if(I+=m,I<0||E<=I){I-=m,m=-m;break}}}function f(b,R,E){const m=new i;E.forEach(function(P){m.put(P.mode.bit,4),m.put(P.getLength(),x.getCharCountIndicator(P.mode,b)),P.write(m)});const I=e.getSymbolTotalCodewords(b),v=a.getTotalCodewordsCount(b,R),S=(I-v)*8;for(m.getLengthInBits()+4<=S&&m.put(0,4);m.getLengthInBits()%8!==0;)m.putBit(0);const C=(S-m.getLengthInBits())/8;for(let P=0;P<C;P++)m.put(P%2?17:236,8);return u(m,b,R)}function u(b,R,E){const m=e.getSymbolTotalCodewords(R),I=a.getTotalCodewordsCount(R,E),v=m-I,S=a.getBlocksCount(R,E),C=m%S,P=S-C,de=Math.floor(m/S),Be=Math.floor(v/S),qn=Be+1,Ut=de-Be,Fn=new l(Ut);let it=0;const Ue=new Array(S),zt=new Array(S);let rt=0;const Vn=new Uint8Array(b.buffer);for(let Se=0;Se<S;Se++){const st=Se<P?Be:qn;Ue[Se]=Vn.slice(it,it+st),zt[Se]=Fn.encode(Ue[Se]),it+=st,rt=Math.max(rt,st)}const ot=new Uint8Array(m);let qt=0,se,ae;for(se=0;se<rt;se++)for(ae=0;ae<S;ae++)se<Ue[ae].length&&(ot[qt++]=Ue[ae][se]);for(se=0;se<Ut;se++)for(ae=0;ae<S;ae++)ot[qt++]=zt[ae][se];return ot}function L(b,R,E,m){let I;if(Array.isArray(b))I=y.fromArray(b);else if(typeof b=="string"){let de=R;if(!de){const Be=y.rawSplit(b);de=c.getBestVersionForData(Be,E)}I=y.fromString(b,de||40)}else throw new Error("Invalid data");const v=c.getBestVersionForData(I,E);if(!v)throw new Error("The amount of data is too big to be stored in a QR Code");if(!R)R=v;else if(R<v)throw new Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+v+`.
`);const S=f(R,E,I),C=e.getSymbolSize(R),P=new r(C);return h(P,R),A(P),g(P,R),w(P,E,0),R>=7&&_(P,R),d(P,S),isNaN(m)&&(m=s.getBestMask(P,w.bind(null,P,E))),s.applyMask(m,P),w(P,E,m),{modules:P,version:R,errorCorrectionLevel:E,maskPattern:m,segments:I}}return lt.create=function(R,E){if(typeof R>"u"||R==="")throw new Error("No input text");let m=t.M,I,v;return typeof E<"u"&&(m=t.from(E.errorCorrectionLevel,t.M),I=c.from(E.version),v=s.from(E.maskPattern),E.toSJISFunc&&e.setToSJISFunction(E.toSJISFunc)),L(R,I,m,v)},lt}var Tt={},_t={},yn;function Nn(){return yn||(yn=1,(function(e){function t(i){if(typeof i=="number"&&(i=i.toString()),typeof i!="string")throw new Error("Color should be defined as hex string");let r=i.slice().replace("#","").split("");if(r.length<3||r.length===5||r.length>8)throw new Error("Invalid hex color: "+i);(r.length===3||r.length===4)&&(r=Array.prototype.concat.apply([],r.map(function(n){return[n,n]}))),r.length===6&&r.push("F","F");const o=parseInt(r.join(""),16);return{r:o>>24&255,g:o>>16&255,b:o>>8&255,a:o&255,hex:"#"+r.slice(0,6).join("")}}e.getOptions=function(r){r||(r={}),r.color||(r.color={});const o=typeof r.margin>"u"||r.margin===null||r.margin<0?4:r.margin,n=r.width&&r.width>=21?r.width:void 0,s=r.scale||4;return{width:n,scale:n?4:s,margin:o,color:{dark:t(r.color.dark||"#000000ff"),light:t(r.color.light||"#ffffffff")},type:r.type,rendererOpts:r.rendererOpts||{}}},e.getScale=function(r,o){return o.width&&o.width>=r+o.margin*2?o.width/(r+o.margin*2):o.scale},e.getImageWidth=function(r,o){const n=e.getScale(r,o);return Math.floor((r+o.margin*2)*n)},e.qrToImageData=function(r,o,n){const s=o.modules.size,a=o.modules.data,l=e.getScale(s,n),c=Math.floor((s+n.margin*2)*l),p=n.margin*l,x=[n.color.light,n.color.dark];for(let y=0;y<c;y++)for(let h=0;h<c;h++){let A=(y*c+h)*4,g=n.color.light;if(y>=p&&h>=p&&y<c-p&&h<c-p){const _=Math.floor((y-p)/l),w=Math.floor((h-p)/l);g=x[a[_*s+w]?1:0]}r[A++]=g.r,r[A++]=g.g,r[A++]=g.b,r[A]=g.a}}})(_t)),_t}var $n;function Mi(){return $n||($n=1,(function(e){const t=Nn();function i(o,n,s){o.clearRect(0,0,n.width,n.height),n.style||(n.style={}),n.height=s,n.width=s,n.style.height=s+"px",n.style.width=s+"px"}function r(){try{return document.createElement("canvas")}catch{throw new Error("You need to specify a canvas element")}}e.render=function(n,s,a){let l=a,c=s;typeof l>"u"&&(!s||!s.getContext)&&(l=s,s=void 0),s||(c=r()),l=t.getOptions(l);const p=t.getImageWidth(n.modules.size,l),x=c.getContext("2d"),y=x.createImageData(p,p);return t.qrToImageData(y.data,n,l),i(x,c,p),x.putImageData(y,0,0),c},e.renderToDataURL=function(n,s,a){let l=a;typeof l>"u"&&(!s||!s.getContext)&&(l=s,s=void 0),l||(l={});const c=e.render(n,s,l),p=l.type||"image/png",x=l.rendererOpts||{};return c.toDataURL(p,x.quality)}})(Tt)),Tt}var It={},vn;function Oi(){if(vn)return It;vn=1;const e=Nn();function t(o,n){const s=o.a/255,a=n+'="'+o.hex+'"';return s<1?a+" "+n+'-opacity="'+s.toFixed(2).slice(1)+'"':a}function i(o,n,s){let a=o+n;return typeof s<"u"&&(a+=" "+s),a}function r(o,n,s){let a="",l=0,c=!1,p=0;for(let x=0;x<o.length;x++){const y=Math.floor(x%n),h=Math.floor(x/n);!y&&!c&&(c=!0),o[x]?(p++,x>0&&y>0&&o[x-1]||(a+=c?i("M",y+s,.5+h+s):i("m",l,0),l=0,c=!1),y+1<n&&o[x+1]||(a+=i("h",p),p=0)):l++}return a}return It.render=function(n,s,a){const l=e.getOptions(s),c=n.modules.size,p=n.modules.data,x=c+l.margin*2,y=l.color.light.a?"<path "+t(l.color.light,"fill")+' d="M0 0h'+x+"v"+x+'H0z"/>':"",h="<path "+t(l.color.dark,"stroke")+' d="'+r(p,c,l.margin)+'"/>',A='viewBox="0 0 '+x+" "+x+'"',_='<svg xmlns="http://www.w3.org/2000/svg" '+(l.width?'width="'+l.width+'" height="'+l.width+'" ':"")+A+' shape-rendering="crispEdges">'+y+h+`</svg>
`;return typeof a=="function"&&a(null,_),_},It}var Cn;function Di(){if(Cn)return Te;Cn=1;const e=yi(),t=Ni(),i=Mi(),r=Oi();function o(n,s,a,l,c){const p=[].slice.call(arguments,1),x=p.length,y=typeof p[x-1]=="function";if(!y&&!e())throw new Error("Callback required as last argument");if(y){if(x<2)throw new Error("Too few arguments provided");x===2?(c=a,a=s,s=l=void 0):x===3&&(s.getContext&&typeof c>"u"?(c=l,l=void 0):(c=l,l=a,a=s,s=void 0))}else{if(x<1)throw new Error("Too few arguments provided");return x===1?(a=s,s=l=void 0):x===2&&!s.getContext&&(l=a,a=s,s=void 0),new Promise(function(h,A){try{const g=t.create(a,l);h(n(g,s,l))}catch(g){A(g)}})}try{const h=t.create(a,l);c(null,n(h,s,l))}catch(h){c(h)}}return Te.create=t.create,Te.toCanvas=o.bind(null,i.render),Te.toDataURL=o.bind(null,i.renderToDataURL),Te.toString=o.bind(null,function(n,s,a){return r.render(n,a)}),Te}var ji=Di();const Ui=oi(ji),zi=.1,xn=2.5,le=7;function At(e,t,i){return e===t?!1:(e-t<0?t-e:e-t)<=i+zi}function qi(e,t){const i=Array.prototype.slice.call(Ui.create(e,{errorCorrectionLevel:t}).modules.data,0),r=Math.sqrt(i.length);return i.reduce((o,n,s)=>(s%r===0?o.push([n]):o[o.length-1].push(n))&&o,[])}const Fi={generate({uri:e,size:t,logoSize:i,padding:r=8,dotColor:o="var(--apkt-colors-black)"}){const s=[],a=qi(e,"Q"),l=(t-2*r)/a.length,c=[{x:0,y:0},{x:1,y:0},{x:0,y:1}];c.forEach(({x:g,y:_})=>{const w=(a.length-le)*l*g+r,d=(a.length-le)*l*_+r,f=.45;for(let u=0;u<c.length;u+=1){const L=l*(le-u*2);s.push(Fe`
            <rect
              fill=${u===2?"var(--apkt-colors-black)":"var(--apkt-colors-white)"}
              width=${u===0?L-10:L}
              rx= ${u===0?(L-10)*f:L*f}
              ry= ${u===0?(L-10)*f:L*f}
              stroke=${o}
              stroke-width=${u===0?10:0}
              height=${u===0?L-10:L}
              x= ${u===0?d+l*u+10/2:d+l*u}
              y= ${u===0?w+l*u+10/2:w+l*u}
            />
          `)}});const p=Math.floor((i+25)/l),x=a.length/2-p/2,y=a.length/2+p/2-1,h=[];a.forEach((g,_)=>{g.forEach((w,d)=>{if(a[_][d]&&!(_<le&&d<le||_>a.length-(le+1)&&d<le||_<le&&d>a.length-(le+1))&&!(_>x&&_<y&&d>x&&d<y)){const f=_*l+l/2+r,u=d*l+l/2+r;h.push([f,u])}})});const A={};return h.forEach(([g,_])=>{A[g]?A[g]?.push(_):A[g]=[_]}),Object.entries(A).map(([g,_])=>{const w=_.filter(d=>_.every(f=>!At(d,f,l)));return[Number(g),w]}).forEach(([g,_])=>{_.forEach(w=>{s.push(Fe`<circle cx=${g} cy=${w} fill=${o} r=${l/xn} />`)})}),Object.entries(A).filter(([g,_])=>_.length>1).map(([g,_])=>{const w=_.filter(d=>_.some(f=>At(d,f,l)));return[Number(g),w]}).map(([g,_])=>{_.sort((d,f)=>d<f?-1:1);const w=[];for(const d of _){const f=w.find(u=>u.some(L=>At(d,L,l)));f?f.push(d):w.push([d])}return[g,w.map(d=>[d[0],d[d.length-1]])]}).forEach(([g,_])=>{_.forEach(([w,d])=>{s.push(Fe`
              <line
                x1=${g}
                x2=${g}
                y1=${w}
                y2=${d}
                stroke=${o}
                stroke-width=${l/(xn/2)}
                stroke-linecap="round"
              />
            `)})}),s}},Vi=z`
  :host {
    position: relative;
    user-select: none;
    display: block;
    overflow: hidden;
    aspect-ratio: 1 / 1;
    width: 100%;
    height: 100%;
    background-color: ${({colors:e})=>e.white};
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
  }

  :host {
    border-radius: ${({borderRadius:e})=>e[4]};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :host([data-clear='true']) > wui-icon {
    display: none;
  }

  svg:first-child,
  wui-image,
  wui-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    box-shadow: inset 0 0 0 4px ${({tokens:e})=>e.theme.backgroundPrimary};
    border-radius: ${({borderRadius:e})=>e[6]};
  }

  wui-image {
    width: 25%;
    height: 25%;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  wui-icon {
    width: 100%;
    height: 100%;
    color: #3396ff !important;
    transform: translateY(-50%) translateX(-50%) scale(0.25);
  }

  wui-icon > svg {
    width: inherit;
    height: inherit;
  }
`;var ge=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let re=class extends ee{constructor(){super(...arguments),this.uri="",this.size=500,this.theme="dark",this.imageSrc=void 0,this.alt=void 0,this.arenaClear=void 0,this.farcaster=void 0}render(){return this.dataset.theme=this.theme,this.dataset.clear=String(this.arenaClear),O`<wui-flex
      alignItems="center"
      justifyContent="center"
      class="wui-qr-code"
      direction="column"
      gap="4"
      width="100%"
      style="height: 100%"
    >
      ${this.templateVisual()} ${this.templateSvg()}
    </wui-flex>`}templateSvg(){return Fe`
      <svg viewBox="0 0 ${this.size} ${this.size}" width="100%" height="100%">
        ${Fi.generate({uri:this.uri,size:this.size,logoSize:this.arenaClear?0:this.size/4})}
      </svg>
    `}templateVisual(){return this.imageSrc?O`<wui-image src=${this.imageSrc} alt=${this.alt??"logo"}></wui-image>`:this.farcaster?O`<wui-icon
        class="farcaster"
        size="inherit"
        color="inherit"
        name="farcaster"
      ></wui-icon>`:O`<wui-icon size="inherit" color="inherit" name="walletConnect"></wui-icon>`}};re.styles=[Z,Vi];ge([T()],re.prototype,"uri",void 0);ge([T({type:Number})],re.prototype,"size",void 0);ge([T()],re.prototype,"theme",void 0);ge([T()],re.prototype,"imageSrc",void 0);ge([T()],re.prototype,"alt",void 0);ge([T({type:Boolean})],re.prototype,"arenaClear",void 0);ge([T({type:Boolean})],re.prototype,"farcaster",void 0);re=ge([N("wui-qr-code")],re);const Hi=z`
  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;var Mn=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let Ge=class extends q{constructor(){super(),this.basic=!1}firstUpdated(){this.basic||K.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet?.name??"WalletConnect",platform:"qrcode",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:B.state.view}})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.forEach(t=>t())}render(){return this.onRenderProxy(),$`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["0","5","5","5"]}
        gap="5"
      >
        <wui-shimmer width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>
        <wui-text variant="lg-medium" color="primary"> Scan this QR Code with your phone </wui-text>
        ${this.copyTemplate()}
      </wui-flex>
      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0)}qrCodeTemplate(){if(!this.uri||!this.ready)return null;const t=this.wallet?this.wallet.name:void 0;k.setWcLinking(void 0),k.setRecentWallet(this.wallet);const i=qe.state.themeVariables["--apkt-qr-color"]??qe.state.themeVariables["--w3m-qr-color"];return $` <wui-qr-code
      theme=${qe.state.themeMode}
      uri=${this.uri}
      imageSrc=${D(fe.getWalletImage(this.wallet))}
      color=${D(i)}
      alt=${D(t)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`}copyTemplate(){const t=!this.uri||!this.ready;return $`<wui-button
      .disabled=${t}
      @click=${this.onCopyUri}
      variant="neutral-secondary"
      size="sm"
      data-testid="copy-wc2-uri"
    >
      Copy link
      <wui-icon size="sm" color="inherit" name="copy" slot="iconRight"></wui-icon>
    </wui-button>`}};Ge.styles=Hi;Mn([U({type:Boolean})],Ge.prototype,"basic",void 0);Ge=Mn([N("w3m-connecting-wc-qrcode")],Ge);var Ki=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let En=class extends G{constructor(){if(super(),this.wallet=B.state.data?.wallet,!this.wallet)throw new Error("w3m-connecting-wc-unsupported: No wallet provided");K.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:B.state.view}})}render(){return $`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="5"
      >
        <wui-wallet-image
          size="lg"
          imageSrc=${D(fe.getWalletImage(this.wallet))}
        ></wui-wallet-image>

        <wui-text variant="md-regular" color="primary">Not Detected</wui-text>
      </wui-flex>

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}};En=Ki([N("w3m-connecting-wc-unsupported")],En);var On=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let kt=class extends q{constructor(){if(super(),this.isLoading=!0,!this.wallet)throw new Error("w3m-connecting-wc-web: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.secondaryBtnLabel="Open",this.secondaryLabel=An.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.updateLoadingState(),this.unsubscribe.push(k.subscribeKey("wcUri",()=>{this.updateLoadingState()})),K.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"web",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:B.state.view}})}updateLoadingState(){this.isLoading=!this.uri}onConnectProxy(){if(this.wallet?.webapp_link&&this.uri)try{this.error=!1;const{webapp_link:t,name:i}=this.wallet,{redirect:r,href:o}=M.formatUniversalUrl(t,this.uri);k.setWcLinking({name:i,href:o}),k.setRecentWallet(this.wallet),M.openHref(r,"_blank")}catch{this.error=!0}}};On([W()],kt.prototype,"isLoading",void 0);kt=On([N("w3m-connecting-wc-web")],kt);const Gi=z`
  :host([data-mobile-fullscreen='true']) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :host([data-mobile-fullscreen='true']) wui-ux-by-reown {
    margin-top: auto;
  }
`;var Re=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let ue=class extends G{constructor(){super(),this.wallet=B.state.data?.wallet,this.unsubscribe=[],this.platform=void 0,this.platforms=[],this.isSiwxEnabled=!!F.state.siwx,this.remoteFeatures=F.state.remoteFeatures,this.displayBranding=!0,this.basic=!1,this.determinePlatforms(),this.initializeConnection(),this.unsubscribe.push(F.subscribeKey("remoteFeatures",t=>this.remoteFeatures=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){return F.state.enableMobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),$`
      ${this.headerTemplate()}
      <div class="platform-container">${this.platformTemplate()}</div>
      ${this.reownBrandingTemplate()}
    `}reownBrandingTemplate(){return!this.remoteFeatures?.reownBranding||!this.displayBranding?null:$`<wui-ux-by-reown></wui-ux-by-reown>`}async initializeConnection(t=!1){if(!(this.platform==="browser"||F.state.manualWCControl&&!t))try{const{wcPairingExpiry:i,status:r}=k.state,{redirectView:o}=B.state.data??{};if(t||F.state.enableEmbedded||M.isPairingExpired(i)||r==="connecting"){const n=k.getConnections(ie.state.activeChain),s=this.remoteFeatures?.multiWallet,a=n.length>0;await k.connectWalletConnect({cache:"never"}),this.isSiwxEnabled||(a&&s?(B.replace("ProfileWallets"),Ne.showSuccess("New Wallet Added")):o?B.replace(o):Tn.close())}}catch(i){if(i instanceof Error&&i.message.includes("An error occurred when attempting to switch chain")&&!F.state.enableNetworkSwitch&&ie.state.activeChain){ie.setActiveCaipNetwork(ti.getUnsupportedNetwork(`${ie.state.activeChain}:${ie.state.activeCaipNetwork?.id}`)),ie.showUnsupportedChainUI();return}i instanceof _n&&i.originalName===In.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?K.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:i.message}}):K.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:i?.message??"Unknown"}}),k.setWcError(!0),Ne.showError(i.message??"Connection error"),k.resetWcConnection(),B.goBack()}}determinePlatforms(){if(!this.wallet){this.platforms.push("qrcode"),this.platform="qrcode";return}if(this.platform)return;const{mobile_link:t,desktop_link:i,webapp_link:r,injected:o,rdns:n}=this.wallet,s=o?.map(({injected_id:g})=>g).filter(Boolean),a=[...n?[n]:s??[]],l=F.state.isUniversalProvider?!1:a.length,c=t,p=r,x=k.checkInstalled(a),y=l&&x,h=i&&!M.isMobile();y&&!ie.state.noAdapters&&this.platforms.push("browser"),c&&this.platforms.push(M.isMobile()?"mobile":"qrcode"),p&&this.platforms.push("web"),h&&this.platforms.push("desktop");const A=ni.isCustomDeeplinkWallet(this.wallet.id,ie.state.activeChain);!y&&l&&!ie.state.noAdapters&&!A&&this.platforms.push("unsupported"),this.platform=this.platforms[0]}platformTemplate(){switch(this.platform){case"browser":return $`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`;case"web":return $`<w3m-connecting-wc-web></w3m-connecting-wc-web>`;case"desktop":return $`
          <w3m-connecting-wc-desktop .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-desktop>
        `;case"mobile":return $`
          <w3m-connecting-wc-mobile isMobile .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-mobile>
        `;case"qrcode":return $`<w3m-connecting-wc-qrcode ?basic=${this.basic}></w3m-connecting-wc-qrcode>`;default:return $`<w3m-connecting-wc-unsupported></w3m-connecting-wc-unsupported>`}}headerTemplate(){return this.platforms.length>1?$`
      <w3m-connecting-header
        .platforms=${this.platforms}
        .onSelectPlatfrom=${this.onSelectPlatform.bind(this)}
      >
      </w3m-connecting-header>
    `:null}async onSelectPlatform(t){const i=this.shadowRoot?.querySelector("div");i&&(await i.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.platform=t,i.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}};ue.styles=Gi;Re([W()],ue.prototype,"platform",void 0);Re([W()],ue.prototype,"platforms",void 0);Re([W()],ue.prototype,"isSiwxEnabled",void 0);Re([W()],ue.prototype,"remoteFeatures",void 0);Re([U({type:Boolean})],ue.prototype,"displayBranding",void 0);Re([U({type:Boolean})],ue.prototype,"basic",void 0);ue=Re([N("w3m-connecting-wc-view")],ue);var Mt=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let Qe=class extends G{constructor(){super(),this.unsubscribe=[],this.isMobile=M.isMobile(),this.remoteFeatures=F.state.remoteFeatures,this.unsubscribe.push(F.subscribeKey("remoteFeatures",t=>this.remoteFeatures=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){if(this.isMobile){const{featured:t,recommended:i}=j.state,{customWallets:r}=F.state,o=ii.getRecentWallets(),n=t.length||i.length||r?.length||o.length;return $`<wui-flex flexDirection="column" gap="2" .margin=${["1","3","3","3"]}>
        ${n?$`<w3m-connector-list></w3m-connector-list>`:null}
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>`}return $`<wui-flex flexDirection="column" .padding=${["0","0","4","0"]}>
        <w3m-connecting-wc-view ?basic=${!0} .displayBranding=${!1}></w3m-connecting-wc-view>
        <wui-flex flexDirection="column" .padding=${["0","3","0","3"]}>
          <w3m-all-wallets-widget></w3m-all-wallets-widget>
        </wui-flex>
      </wui-flex>
      ${this.reownBrandingTemplate()} `}reownBrandingTemplate(){return this.remoteFeatures?.reownBranding?$` <wui-flex flexDirection="column" .padding=${["1","0","1","0"]}>
      <wui-ux-by-reown></wui-ux-by-reown>
    </wui-flex>`:null}};Mt([W()],Qe.prototype,"isMobile",void 0);Mt([W()],Qe.prototype,"remoteFeatures",void 0);Qe=Mt([N("w3m-connecting-wc-basic-view")],Qe);/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Qi=e=>e.strings===void 0;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Le=(e,t)=>{const i=e._$AN;if(i===void 0)return!1;for(const r of i)r._$AO?.(t,!1),Le(r,t);return!0},Je=e=>{let t,i;do{if((t=e._$AM)===void 0)break;i=t._$AN,i.delete(e),e=t}while(i?.size===0)},Dn=e=>{for(let t;t=e._$AM;e=t){let i=t._$AN;if(i===void 0)t._$AN=i=new Set;else if(i.has(e))break;i.add(e),Xi(t)}};function Ji(e){this._$AN!==void 0?(Je(this),this._$AM=e,Dn(this)):this._$AM=e}function Yi(e,t=!1,i=0){const r=this._$AH,o=this._$AN;if(o!==void 0&&o.size!==0)if(t)if(Array.isArray(r))for(let n=i;n<r.length;n++)Le(r[n],!1),Je(r[n]);else r!=null&&(Le(r,!1),Je(r));else Le(this,e)}const Xi=e=>{e.type==Kn.CHILD&&(e._$AP??=Yi,e._$AQ??=Ji)};class Zi extends Hn{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,i,r){super._$AT(t,i,r),Dn(this),this.isConnected=t._$AU}_$AO(t,i=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),i&&(Le(this,t),Je(this))}setValue(t){if(Qi(this._$Ct))this._$Ct._$AI(t,this);else{const i=[...this._$Ct._$AH];i[this._$Ci]=t,this._$Ct._$AI(i,this,0)}}disconnected(){}reconnected(){}}/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ot=()=>new er;class er{}const Wt=new WeakMap,Dt=Gn(class extends Zi{render(e){return Vt}update(e,[t]){const i=t!==this.G;return i&&this.rt(void 0),(i||this.lt!==this.ct)&&(this.G=t,this.ht=e.options?.host,this.rt(this.ct=e.element)),Vt}rt(e){if(this.G!==void 0)if(this.isConnected||(e=void 0),typeof this.G=="function"){const t=this.ht??globalThis;let i=Wt.get(t);i===void 0&&(i=new WeakMap,Wt.set(t,i)),i.get(this.G)!==void 0&&this.G.call(this.ht,void 0),i.set(this.G,e),e!==void 0&&this.G.call(this.ht,e)}else this.G.value=e}get lt(){return typeof this.G=="function"?Wt.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}}),tr=z`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  label {
    position: relative;
    display: inline-block;
    user-select: none;
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      border ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      width ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      height ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({colors:e})=>e.neutrals300};
    border-radius: ${({borderRadius:e})=>e.round};
    border: 1px solid transparent;
    will-change: border;
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      border ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      width ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      height ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  span:before {
    content: '';
    position: absolute;
    background-color: ${({colors:e})=>e.white};
    border-radius: 50%;
  }

  /* -- Sizes --------------------------------------------------------- */
  label[data-size='lg'] {
    width: 48px;
    height: 32px;
  }

  label[data-size='md'] {
    width: 40px;
    height: 28px;
  }

  label[data-size='sm'] {
    width: 32px;
    height: 22px;
  }

  label[data-size='lg'] > span:before {
    height: 24px;
    width: 24px;
    left: 4px;
    top: 3px;
  }

  label[data-size='md'] > span:before {
    height: 20px;
    width: 20px;
    left: 4px;
    top: 3px;
  }

  label[data-size='sm'] > span:before {
    height: 16px;
    width: 16px;
    left: 3px;
    top: 2px;
  }

  /* -- Focus states --------------------------------------------------- */
  input:focus-visible:not(:checked) + span,
  input:focus:not(:checked) + span {
    border: 1px solid ${({tokens:e})=>e.core.iconAccentPrimary};
    background-color: ${({tokens:e})=>e.theme.textTertiary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  input:focus-visible:checked + span,
  input:focus:checked + span {
    border: 1px solid ${({tokens:e})=>e.core.iconAccentPrimary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  /* -- Checked states --------------------------------------------------- */
  input:checked + span {
    background-color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  label[data-size='lg'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='md'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='sm'] > input:checked + span:before {
    transform: translateX(calc(100% - 7px));
  }

  /* -- Hover states ------------------------------------------------------- */
  label:hover > input:not(:checked):not(:disabled) + span {
    background-color: ${({colors:e})=>e.neutrals400};
  }

  label:hover > input:checked:not(:disabled) + span {
    background-color: ${({colors:e})=>e.accent080};
  }

  /* -- Disabled state --------------------------------------------------- */
  label:has(input:disabled) {
    pointer-events: none;
    user-select: none;
  }

  input:not(:checked):disabled + span {
    background-color: ${({colors:e})=>e.neutrals700};
  }

  input:checked:disabled + span {
    background-color: ${({colors:e})=>e.neutrals700};
  }

  input:not(:checked):disabled + span::before {
    background-color: ${({colors:e})=>e.neutrals400};
  }

  input:checked:disabled + span::before {
    background-color: ${({tokens:e})=>e.theme.textTertiary};
  }
`;var nt=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let Ie=class extends ee{constructor(){super(...arguments),this.inputElementRef=Ot(),this.checked=!1,this.disabled=!1,this.size="md"}render(){return O`
      <label data-size=${this.size}>
        <input
          ${Dt(this.inputElementRef)}
          type="checkbox"
          ?checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.dispatchChangeEvent.bind(this)}
        />
        <span></span>
      </label>
    `}dispatchChangeEvent(){this.dispatchEvent(new CustomEvent("switchChange",{detail:this.inputElementRef.value?.checked,bubbles:!0,composed:!0}))}};Ie.styles=[Z,Ce,tr];nt([T({type:Boolean})],Ie.prototype,"checked",void 0);nt([T({type:Boolean})],Ie.prototype,"disabled",void 0);nt([T()],Ie.prototype,"size",void 0);Ie=nt([N("wui-toggle")],Ie);const nr=z`
  :host {
    height: auto;
  }

  :host > wui-flex {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
    cursor: pointer;
  }

  wui-switch {
    pointer-events: none;
  }
`;var jn=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let Ye=class extends ee{constructor(){super(...arguments),this.checked=!1}render(){return O`
      <wui-flex>
        <wui-icon size="xl" name="walletConnectBrown"></wui-icon>
        <wui-toggle
          ?checked=${this.checked}
          size="sm"
          @switchChange=${this.handleToggleChange.bind(this)}
        ></wui-toggle>
      </wui-flex>
    `}handleToggleChange(t){t.stopPropagation(),this.checked=t.detail,this.dispatchSwitchEvent()}dispatchSwitchEvent(){this.dispatchEvent(new CustomEvent("certifiedSwitchChange",{detail:this.checked,bubbles:!0,composed:!0}))}};Ye.styles=[Z,Ce,nr];jn([T({type:Boolean})],Ye.prototype,"checked",void 0);Ye=jn([N("wui-certified-switch")],Ye);const ir=z`
  :host {
    position: relative;
    width: 100%;
    display: inline-flex;
    flex-direction: column;
    gap: ${({spacing:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.textPrimary};
    caret-color: ${({tokens:e})=>e.core.textAccentPrimary};
  }

  .wui-input-text-container {
    position: relative;
    display: flex;
  }

  input {
    width: 100%;
    border-radius: ${({borderRadius:e})=>e[4]};
    color: inherit;
    background: transparent;
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
    caret-color: ${({tokens:e})=>e.core.textAccentPrimary};
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[3]} ${({spacing:e})=>e[10]};
    font-size: ${({textSize:e})=>e.large};
    line-height: ${({typography:e})=>e["lg-regular"].lineHeight};
    letter-spacing: ${({typography:e})=>e["lg-regular"].letterSpacing};
    font-weight: ${({fontWeight:e})=>e.regular};
    font-family: ${({fontFamily:e})=>e.regular};
  }

  input[data-size='lg'] {
    padding: ${({spacing:e})=>e[4]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[4]} ${({spacing:e})=>e[10]};
  }

  @media (hover: hover) and (pointer: fine) {
    input:hover:enabled {
      border: 1px solid ${({tokens:e})=>e.theme.borderSecondary};
    }
  }

  input:disabled {
    cursor: unset;
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
  }

  input::placeholder {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  input:focus:enabled {
    border: 1px solid ${({tokens:e})=>e.theme.borderSecondary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    -webkit-box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
    -moz-box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
    box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
  }

  div.wui-input-text-container:has(input:disabled) {
    opacity: 0.5;
  }

  wui-icon.wui-input-text-left-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    left: ${({spacing:e})=>e[4]};
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button.wui-input-text-submit-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:e})=>e[3]};
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: ${({borderRadius:e})=>e[2]};
    color: ${({tokens:e})=>e.core.textAccentPrimary};
  }

  button.wui-input-text-submit-button:disabled {
    opacity: 1;
  }

  button.wui-input-text-submit-button.loading wui-icon {
    animation: spin 1s linear infinite;
  }

  button.wui-input-text-submit-button:hover {
    background: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  input:has(+ .wui-input-text-submit-button) {
    padding-right: ${({spacing:e})=>e[12]};
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  input[type='search']::-webkit-search-decoration,
  input[type='search']::-webkit-search-cancel-button,
  input[type='search']::-webkit-search-results-button,
  input[type='search']::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  /* -- Keyframes --------------------------------------------------- */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;var J=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let V=class extends ee{constructor(){super(...arguments),this.inputElementRef=Ot(),this.disabled=!1,this.loading=!1,this.placeholder="",this.type="text",this.value="",this.size="md"}render(){return O` <div class="wui-input-text-container">
        ${this.templateLeftIcon()}
        <input
          data-size=${this.size}
          ${Dt(this.inputElementRef)}
          data-testid="wui-input-text"
          type=${this.type}
          enterkeyhint=${Qn(this.enterKeyHint)}
          ?disabled=${this.disabled}
          placeholder=${this.placeholder}
          @input=${this.dispatchInputChangeEvent.bind(this)}
          @keydown=${this.onKeyDown}
          .value=${this.value||""}
        />
        ${this.templateSubmitButton()}
        <slot class="wui-input-text-slot"></slot>
      </div>
      ${this.templateError()} ${this.templateWarning()}`}templateLeftIcon(){return this.icon?O`<wui-icon
        class="wui-input-text-left-icon"
        size="md"
        data-size=${this.size}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`:null}templateSubmitButton(){return this.onSubmit?O`<button
        class="wui-input-text-submit-button ${this.loading?"loading":""}"
        @click=${this.onSubmit?.bind(this)}
        ?disabled=${this.disabled||this.loading}
      >
        ${this.loading?O`<wui-icon name="spinner" size="md"></wui-icon>`:O`<wui-icon name="chevronRight" size="md"></wui-icon>`}
      </button>`:null}templateError(){return this.errorText?O`<wui-text variant="sm-regular" color="error">${this.errorText}</wui-text>`:null}templateWarning(){return this.warningText?O`<wui-text variant="sm-regular" color="warning">${this.warningText}</wui-text>`:null}dispatchInputChangeEvent(){this.dispatchEvent(new CustomEvent("inputChange",{detail:this.inputElementRef.value?.value,bubbles:!0,composed:!0}))}};V.styles=[Z,Ce,ir];J([T()],V.prototype,"icon",void 0);J([T({type:Boolean})],V.prototype,"disabled",void 0);J([T({type:Boolean})],V.prototype,"loading",void 0);J([T()],V.prototype,"placeholder",void 0);J([T()],V.prototype,"type",void 0);J([T()],V.prototype,"value",void 0);J([T()],V.prototype,"errorText",void 0);J([T()],V.prototype,"warningText",void 0);J([T()],V.prototype,"onSubmit",void 0);J([T()],V.prototype,"size",void 0);J([T({attribute:!1})],V.prototype,"onKeyDown",void 0);V=J([N("wui-input-text")],V);const rr=z`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  wui-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.iconDefault};
    cursor: pointer;
    padding: ${({spacing:e})=>e[2]};
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
  }

  @media (hover: hover) {
    wui-icon:hover {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }
`;var Un=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let Xe=class extends ee{constructor(){super(...arguments),this.inputComponentRef=Ot(),this.inputValue=""}render(){return O`
      <wui-input-text
        ${Dt(this.inputComponentRef)}
        placeholder="Search wallet"
        icon="search"
        type="search"
        enterKeyHint="search"
        size="sm"
        @inputChange=${this.onInputChange}
      >
        ${this.inputValue?O`<wui-icon
              @click=${this.clearValue}
              color="inherit"
              size="sm"
              name="close"
            ></wui-icon>`:null}
      </wui-input-text>
    `}onInputChange(t){this.inputValue=t.detail||""}clearValue(){const i=this.inputComponentRef.value?.inputElementRef.value;i&&(i.value="",this.inputValue="",i.focus(),i.dispatchEvent(new Event("input")))}};Xe.styles=[Z,rr];Un([T()],Xe.prototype,"inputValue",void 0);Xe=Un([N("wui-search-bar")],Xe);const or=z`
  :host {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 104px;
    width: 104px;
    row-gap: ${({spacing:e})=>e[2]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[5]};
    position: relative;
  }

  wui-shimmer[data-type='network'] {
    border: none;
    -webkit-clip-path: var(--apkt-path-network);
    clip-path: var(--apkt-path-network);
  }

  svg {
    position: absolute;
    width: 48px;
    height: 54px;
    z-index: 1;
  }

  svg > path {
    stroke: ${({tokens:e})=>e.theme.foregroundSecondary};
    stroke-width: 1px;
  }

  @media (max-width: 350px) {
    :host {
      width: 100%;
    }
  }
`;var zn=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let Ze=class extends ee{constructor(){super(...arguments),this.type="wallet"}render(){return O`
      ${this.shimmerTemplate()}
      <wui-shimmer width="80px" height="20px"></wui-shimmer>
    `}shimmerTemplate(){return this.type==="network"?O` <wui-shimmer data-type=${this.type} width="48px" height="54px"></wui-shimmer>
        ${Jn}`:O`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}};Ze.styles=[Z,Ce,or];zn([T()],Ze.prototype,"type",void 0);Ze=zn([N("wui-card-select-loader")],Ze);const sr=ri`
  :host {
    display: grid;
    width: inherit;
    height: inherit;
  }
`;var Y=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let H=class extends ee{render(){return this.style.cssText=`
      grid-template-rows: ${this.gridTemplateRows};
      grid-template-columns: ${this.gridTemplateColumns};
      justify-items: ${this.justifyItems};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      align-content: ${this.alignContent};
      column-gap: ${this.columnGap&&`var(--apkt-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--apkt-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--apkt-spacing-${this.gap})`};
      padding-top: ${this.padding&&ce.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&ce.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&ce.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&ce.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&ce.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&ce.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&ce.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&ce.getSpacingStyles(this.margin,3)};
    `,O`<slot></slot>`}};H.styles=[Z,sr];Y([T()],H.prototype,"gridTemplateRows",void 0);Y([T()],H.prototype,"gridTemplateColumns",void 0);Y([T()],H.prototype,"justifyItems",void 0);Y([T()],H.prototype,"alignItems",void 0);Y([T()],H.prototype,"justifyContent",void 0);Y([T()],H.prototype,"alignContent",void 0);Y([T()],H.prototype,"columnGap",void 0);Y([T()],H.prototype,"rowGap",void 0);Y([T()],H.prototype,"gap",void 0);Y([T()],H.prototype,"padding",void 0);Y([T()],H.prototype,"margin",void 0);H=Y([N("wui-grid")],H);const ar=z`
  button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 104px;
    row-gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[0]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: clamp(0px, ${({borderRadius:e})=>e[4]}, 20px);
    transition:
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-1"]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]};
    will-change: background-color, color, border-radius;
    outline: none;
    border: none;
  }

  button > wui-flex > wui-text {
    color: ${({tokens:e})=>e.theme.textPrimary};
    max-width: 86px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button > wui-flex > wui-text.certified {
    max-width: 66px;
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button:disabled > wui-flex > wui-text {
    color: ${({tokens:e})=>e.core.glass010};
  }

  [data-selected='true'] {
    background-color: ${({colors:e})=>e.accent020};
  }

  @media (hover: hover) and (pointer: fine) {
    [data-selected='true']:hover:enabled {
      background-color: ${({colors:e})=>e.accent010};
    }
  }

  [data-selected='true']:active:enabled {
    background-color: ${({colors:e})=>e.accent010};
  }

  @media (max-width: 350px) {
    button {
      width: 100%;
    }
  }
`;var oe=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let Q=class extends G{constructor(){super(),this.observer=new IntersectionObserver(()=>{}),this.visible=!1,this.imageSrc=void 0,this.imageLoading=!1,this.isImpressed=!1,this.explorerId="",this.walletQuery="",this.certified=!1,this.displayIndex=0,this.wallet=void 0,this.observer=new IntersectionObserver(t=>{t.forEach(i=>{i.isIntersecting?(this.visible=!0,this.fetchImageSrc(),this.sendImpressionEvent()):this.visible=!1})},{threshold:.01})}firstUpdated(){this.observer.observe(this)}disconnectedCallback(){this.observer.disconnect()}render(){const t=this.wallet?.badge_type==="certified";return $`
      <button>
        ${this.imageTemplate()}
        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="1">
          <wui-text
            variant="md-regular"
            color="inherit"
            class=${D(t?"certified":void 0)}
            >${this.wallet?.name}</wui-text
          >
          ${t?$`<wui-icon size="sm" name="walletConnectBrown"></wui-icon>`:null}
        </wui-flex>
      </button>
    `}imageTemplate(){return!this.visible&&!this.imageSrc||this.imageLoading?this.shimmerTemplate():$`
      <wui-wallet-image
        size="lg"
        imageSrc=${D(this.imageSrc)}
        name=${D(this.wallet?.name)}
        .installed=${this.wallet?.installed??!1}
        badgeSize="sm"
      >
      </wui-wallet-image>
    `}shimmerTemplate(){return $`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}async fetchImageSrc(){this.wallet&&(this.imageSrc=fe.getWalletImage(this.wallet),!this.imageSrc&&(this.imageLoading=!0,this.imageSrc=await fe.fetchWalletImage(this.wallet.image_id),this.imageLoading=!1))}sendImpressionEvent(){!this.wallet||this.isImpressed||(this.isImpressed=!0,K.sendWalletImpressionEvent({name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.explorerId,view:B.state.view,query:this.walletQuery,certified:this.certified,displayIndex:this.displayIndex}))}};Q.styles=ar;oe([W()],Q.prototype,"visible",void 0);oe([W()],Q.prototype,"imageSrc",void 0);oe([W()],Q.prototype,"imageLoading",void 0);oe([W()],Q.prototype,"isImpressed",void 0);oe([U()],Q.prototype,"explorerId",void 0);oe([U()],Q.prototype,"walletQuery",void 0);oe([U()],Q.prototype,"certified",void 0);oe([U()],Q.prototype,"displayIndex",void 0);oe([U({type:Object})],Q.prototype,"wallet",void 0);Q=oe([N("w3m-all-wallets-list-item")],Q);const lr=z`
  wui-grid {
    max-height: clamp(360px, 400px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  :host([data-mobile-fullscreen='true']) wui-grid {
    max-height: none;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  w3m-all-wallets-list-item {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-inout-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  wui-loading-spinner {
    padding-top: ${({spacing:e})=>e[4]};
    padding-bottom: ${({spacing:e})=>e[4]};
    justify-content: center;
    grid-column: 1 / span 4;
  }
`;var De=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};const Rn="local-paginator";let $e=class extends G{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.loading=!j.state.wallets.length,this.wallets=j.state.wallets,this.mobileFullScreen=F.state.enableMobileFullScreen,this.unsubscribe.push(j.subscribeKey("wallets",t=>this.wallets=t))}firstUpdated(){this.initialFetch(),this.createPaginationObserver()}disconnectedCallback(){this.unsubscribe.forEach(t=>t()),this.paginationObserver?.disconnect()}render(){return this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),$`
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${["0","3","3","3"]}
        gap="2"
        justifyContent="space-between"
      >
        ${this.loading?this.shimmerTemplate(16):this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `}async initialFetch(){this.loading=!0;const t=this.shadowRoot?.querySelector("wui-grid");t&&(await j.fetchWalletsByPage({page:1}),await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.loading=!1,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}shimmerTemplate(t,i){return[...Array(t)].map(()=>$`
        <wui-card-select-loader type="wallet" id=${D(i)}></wui-card-select-loader>
      `)}walletsTemplate(){return Bt.getWalletConnectWallets(this.wallets).map((t,i)=>$`
        <w3m-all-wallets-list-item
          data-testid="wallet-search-item-${t.id}"
          @click=${()=>this.onConnectWallet(t)}
          .wallet=${t}
          explorerId=${t.id}
          certified=${this.badge==="certified"}
          displayIndex=${i}
        ></w3m-all-wallets-list-item>
      `)}paginationLoaderTemplate(){const{wallets:t,recommended:i,featured:r,count:o,mobileFilteredOutWalletsLength:n}=j.state,s=window.innerWidth<352?3:4,a=t.length+i.length;let c=Math.ceil(a/s)*s-a+s;return c-=t.length?r.length%s:0,o===0&&r.length>0?null:o===0||[...r,...t,...i].length<o-(n??0)?this.shimmerTemplate(c,Rn):null}createPaginationObserver(){const t=this.shadowRoot?.querySelector(`#${Rn}`);t&&(this.paginationObserver=new IntersectionObserver(([i])=>{if(i?.isIntersecting&&!this.loading){const{page:r,count:o,wallets:n}=j.state;n.length<o&&j.fetchWalletsByPage({page:r+1})}}),this.paginationObserver.observe(t))}onConnectWallet(t){X.selectWalletConnector(t)}};$e.styles=lr;De([W()],$e.prototype,"loading",void 0);De([W()],$e.prototype,"wallets",void 0);De([W()],$e.prototype,"badge",void 0);De([W()],$e.prototype,"mobileFullScreen",void 0);$e=De([N("w3m-all-wallets-list")],$e);const cr=Yn`
  wui-grid,
  wui-loading-spinner,
  wui-flex {
    height: 360px;
  }

  wui-grid {
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  :host([data-mobile-fullscreen='true']) wui-grid {
    max-height: none;
    height: auto;
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;var je=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let ve=class extends G{constructor(){super(...arguments),this.prevQuery="",this.prevBadge=void 0,this.loading=!0,this.mobileFullScreen=F.state.enableMobileFullScreen,this.query=""}render(){return this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),this.onSearch(),this.loading?$`<wui-loading-spinner color="accent-primary"></wui-loading-spinner>`:this.walletsTemplate()}async onSearch(){(this.query.trim()!==this.prevQuery.trim()||this.badge!==this.prevBadge)&&(this.prevQuery=this.query,this.prevBadge=this.badge,this.loading=!0,await j.searchWallet({search:this.query,badge:this.badge}),this.loading=!1)}walletsTemplate(){const{search:t}=j.state,i=Bt.markWalletsAsInstalled(t),r=Bt.filterWalletsByWcSupport(i);return r.length?$`
      <wui-grid
        data-testid="wallet-list"
        .padding=${["0","3","3","3"]}
        rowGap="4"
        columngap="2"
        justifyContent="space-between"
      >
        ${r.map((o,n)=>$`
            <w3m-all-wallets-list-item
              @click=${()=>this.onConnectWallet(o)}
              .wallet=${o}
              data-testid="wallet-search-item-${o.id}"
              explorerId=${o.id}
              certified=${this.badge==="certified"}
              walletQuery=${this.query}
              displayIndex=${n}
            ></w3m-all-wallets-list-item>
          `)}
      </wui-grid>
    `:$`
        <wui-flex
          data-testid="no-wallet-found"
          justifyContent="center"
          alignItems="center"
          gap="3"
          flexDirection="column"
        >
          <wui-icon-box size="lg" color="default" icon="wallet"></wui-icon-box>
          <wui-text data-testid="no-wallet-found-text" color="secondary" variant="md-medium">
            No Wallet found
          </wui-text>
        </wui-flex>
      `}onConnectWallet(t){X.selectWalletConnector(t)}};ve.styles=cr;je([W()],ve.prototype,"loading",void 0);je([W()],ve.prototype,"mobileFullScreen",void 0);je([U()],ve.prototype,"query",void 0);je([U()],ve.prototype,"badge",void 0);ve=je([N("w3m-all-wallets-search")],ve);var jt=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let et=class extends G{constructor(){super(...arguments),this.search="",this.badge=void 0,this.onDebouncedSearch=M.debounce(t=>{this.search=t})}render(){const t=this.search.length>=2;return $`
      <wui-flex .padding=${["1","3","3","3"]} gap="2" alignItems="center">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        <wui-certified-switch
          ?checked=${this.badge==="certified"}
          @certifiedSwitchChange=${this.onCertifiedSwitchChange.bind(this)}
          data-testid="wui-certified-switch"
        ></wui-certified-switch>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${t||this.badge?$`<w3m-all-wallets-search
            query=${this.search}
            .badge=${this.badge}
          ></w3m-all-wallets-search>`:$`<w3m-all-wallets-list .badge=${this.badge}></w3m-all-wallets-list>`}
    `}onInputChange(t){this.onDebouncedSearch(t.detail)}onCertifiedSwitchChange(t){t.detail?(this.badge="certified",Ne.showSvg("Only WalletConnect certified",{icon:"walletConnectBrown",iconColor:"accent-100"})):this.badge=void 0}qrButtonTemplate(){return M.isMobile()?$`
        <wui-icon-box
          size="xl"
          iconSize="xl"
          color="accent-primary"
          icon="qrCode"
          border
          borderColor="wui-accent-glass-010"
          @click=${this.onWalletConnectQr.bind(this)}
        ></wui-icon-box>
      `:null}onWalletConnectQr(){B.push("ConnectingWalletConnect")}};jt([W()],et.prototype,"search",void 0);jt([W()],et.prototype,"badge",void 0);et=jt([N("w3m-all-wallets-view")],et);var ur=function(e,t,i,r){var o=arguments.length,n=o<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,i):r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let Sn=class extends G{constructor(){super(...arguments),this.wallet=B.state.data?.wallet}render(){if(!this.wallet)throw new Error("w3m-downloads-view");return $`
      <wui-flex gap="2" flexDirection="column" .padding=${["3","3","4","3"]}>
        ${this.chromeTemplate()} ${this.iosTemplate()} ${this.androidTemplate()}
        ${this.homepageTemplate()}
      </wui-flex>
    `}chromeTemplate(){return this.wallet?.chrome_store?$`<wui-list-item
      variant="icon"
      icon="chromeStore"
      iconVariant="square"
      @click=${this.onChromeStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Chrome Extension</wui-text>
    </wui-list-item>`:null}iosTemplate(){return this.wallet?.app_store?$`<wui-list-item
      variant="icon"
      icon="appStore"
      iconVariant="square"
      @click=${this.onAppStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">iOS App</wui-text>
    </wui-list-item>`:null}androidTemplate(){return this.wallet?.play_store?$`<wui-list-item
      variant="icon"
      icon="playStore"
      iconVariant="square"
      @click=${this.onPlayStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Android App</wui-text>
    </wui-list-item>`:null}homepageTemplate(){return this.wallet?.homepage?$`
      <wui-list-item
        variant="icon"
        icon="browser"
        iconVariant="square-blue"
        @click=${this.onHomePage.bind(this)}
        chevron
      >
        <wui-text variant="md-medium" color="primary">Website</wui-text>
      </wui-list-item>
    `:null}openStore(t){t.href&&this.wallet&&(K.sendEvent({type:"track",event:"GET_WALLET",properties:{name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.wallet.id,type:t.type}}),M.openHref(t.href,"_blank"))}onChromeStore(){this.wallet?.chrome_store&&this.openStore({href:this.wallet.chrome_store,type:"chrome_store"})}onAppStore(){this.wallet?.app_store&&this.openStore({href:this.wallet.app_store,type:"app_store"})}onPlayStore(){this.wallet?.play_store&&this.openStore({href:this.wallet.play_store,type:"play_store"})}onHomePage(){this.wallet?.homepage&&this.openStore({href:this.wallet.homepage,type:"homepage"})}};Sn=ur([N("w3m-downloads-view")],Sn);export{et as W3mAllWalletsView,Qe as W3mConnectingWcBasicView,Sn as W3mDownloadsView};
