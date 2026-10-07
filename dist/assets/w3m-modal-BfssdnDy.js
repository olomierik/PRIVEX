import{c as A,n as y,f as Ht,r as S,i as Y,b as u,g as ci,U as St,a as I,o as ye,h as qt}from"./index-C2r6kl6N.js";import{N as k,w as Ln,R as m,S as C,b as G,c as U,E as K,q as dt,s as pt,h as f,B as Me,a as ee,t as je,u as qe,v as Bn,m as Ut,x as li,C as q,y as zn,z as Fn,D as Mn,M as H,F as jn,d as E,r as pe,i as Tt,P as ui,G as di,I as D,J as pi,H as se,O as N,K as un,g as Q,L as Ye,e as hi,A as lt,T as mi,Q as wi,U as fi}from"./core-Dllqebwz.js";import{a as he,b as P,w as Hn}from"./walletconnect-CN6MBSCx.js";import"./onchain-D9AOtLYB.js";import"./supabase-C3NHck8P.js";const ve={getGasPriceInEther(t,e){const n=e*t;return Number(n)/1e18},getGasPriceInUSD(t,e,n){const i=ve.getGasPriceInEther(e,n);return k.bigNumber(t).times(i).toNumber()},getPriceImpact({sourceTokenAmount:t,sourceTokenPriceInUSD:e,toTokenPriceInUSD:n,toTokenAmount:i}){const s=k.bigNumber(t).times(e),o=k.bigNumber(i).times(n);return s.minus(o).div(s).times(100).toNumber()},getMaxSlippage(t,e){const n=k.bigNumber(t).div(100);return k.multiply(e,n).toNumber()},getProviderFee(t,e=.0085){return k.bigNumber(t).times(e).toString()},isInsufficientNetworkTokenForGas(t,e){const n=e||"0";return k.bigNumber(t).eq(0)?!0:k.bigNumber(k.bigNumber(n)).gt(t)},isInsufficientSourceTokenForSwap(t,e,n){const i=n?.find(o=>o.address===e)?.quantity?.numeric;return k.bigNumber(i||"0").lt(t)}},dn=15e4,gi=6,j={initializing:!1,initialized:!1,loadingPrices:!1,loadingQuote:!1,loadingApprovalTransaction:!1,loadingBuildTransaction:!1,loadingTransaction:!1,switchingTokens:!1,fetchError:!1,approvalTransaction:void 0,swapTransaction:void 0,transactionError:void 0,sourceToken:void 0,sourceTokenAmount:"",sourceTokenPriceInUSD:0,toToken:void 0,toTokenAmount:"",toTokenPriceInUSD:0,networkPrice:"0",networkBalanceInUSD:"0",networkTokenSymbol:"",inputError:void 0,slippage:Ut.CONVERT_SLIPPAGE_TOLERANCE,tokens:void 0,popularTokens:void 0,suggestedTokens:void 0,foundTokens:void 0,myTokensWithBalance:void 0,tokensPriceMap:{},gasFee:"0",gasPriceInUSD:0,priceImpact:void 0,maxSlippage:void 0,providerFee:void 0},c=Mn({...j}),ht={state:c,subscribe(t){return Fn(c,()=>t(c))},subscribeKey(t,e){return zn(c,t,e)},getParams(){const t=f.state.activeChain,e=f.getAccountData(t)?.caipAddress??f.state.activeCaipAddress,n=ee.getPlainAddress(e),i=li(),s=q.getConnectorId(f.state.activeChain);if(!n)throw new Error("No address found to swap the tokens from.");const o=!c.toToken?.address||!c.toToken?.decimals,r=!c.sourceToken?.address||!c.sourceToken?.decimals||!k.bigNumber(c.sourceTokenAmount).gt(0),a=!c.sourceTokenAmount;return{networkAddress:i,fromAddress:n,fromCaipAddress:e,sourceTokenAddress:c.sourceToken?.address,toTokenAddress:c.toToken?.address,toTokenAmount:c.toTokenAmount,toTokenDecimals:c.toToken?.decimals,sourceTokenAmount:c.sourceTokenAmount,sourceTokenDecimals:c.sourceToken?.decimals,invalidToToken:o,invalidSourceToken:r,invalidSourceTokenAmount:a,availableToSwap:e&&!o&&!r&&!a,isAuthConnector:s===U.CONNECTOR_ID.AUTH}},async setSourceToken(t){if(!t){c.sourceToken=t,c.sourceTokenAmount="",c.sourceTokenPriceInUSD=0;return}c.sourceToken=t,await w.setTokenPrice(t.address,"sourceToken")},setSourceTokenAmount(t){c.sourceTokenAmount=t},async setToToken(t){if(!t){c.toToken=t,c.toTokenAmount="",c.toTokenPriceInUSD=0;return}c.toToken=t,await w.setTokenPrice(t.address,"toToken")},setToTokenAmount(t){c.toTokenAmount=t?k.toFixed(t,gi):""},async setTokenPrice(t,e){let n=c.tokensPriceMap[t]||0;n||(c.loadingPrices=!0,n=await w.getAddressPrice(t)),e==="sourceToken"?c.sourceTokenPriceInUSD=n:e==="toToken"&&(c.toTokenPriceInUSD=n),c.loadingPrices&&(c.loadingPrices=!1),w.getParams().availableToSwap&&!c.switchingTokens&&w.swapTokens()},async switchTokens(){if(!(c.initializing||!c.initialized||c.switchingTokens)){c.switchingTokens=!0;try{const t=c.toToken?{...c.toToken}:void 0,e=c.sourceToken?{...c.sourceToken}:void 0,n=t&&c.toTokenAmount===""?"1":c.toTokenAmount;w.setSourceTokenAmount(n),w.setToTokenAmount(""),await w.setSourceToken(t),await w.setToToken(e),c.switchingTokens=!1,w.swapTokens()}catch(t){throw c.switchingTokens=!1,t}}},resetState(){c.myTokensWithBalance=j.myTokensWithBalance,c.tokensPriceMap=j.tokensPriceMap,c.initialized=j.initialized,c.initializing=j.initializing,c.switchingTokens=j.switchingTokens,c.sourceToken=j.sourceToken,c.sourceTokenAmount=j.sourceTokenAmount,c.sourceTokenPriceInUSD=j.sourceTokenPriceInUSD,c.toToken=j.toToken,c.toTokenAmount=j.toTokenAmount,c.toTokenPriceInUSD=j.toTokenPriceInUSD,c.networkPrice=j.networkPrice,c.networkTokenSymbol=j.networkTokenSymbol,c.networkBalanceInUSD=j.networkBalanceInUSD,c.inputError=j.inputError},resetValues(){const{networkAddress:t}=w.getParams(),e=c.tokens?.find(n=>n.address===t);w.setSourceToken(e),w.setToToken(void 0)},getApprovalLoadingState(){return c.loadingApprovalTransaction},clearError(){c.transactionError=void 0},async initializeState(){if(!c.initializing){if(c.initializing=!0,!c.initialized)try{await w.fetchTokens(),c.initialized=!0}catch{c.initialized=!1,C.showError("Failed to initialize swap"),m.goBack()}c.initializing=!1}},async fetchTokens(){const{networkAddress:t}=w.getParams();await w.getNetworkTokenPrice(),await w.getMyTokensWithBalance();const e=c.myTokensWithBalance?.find(n=>n.address===t);e&&(c.networkTokenSymbol=e.symbol,w.setSourceToken(e),w.setSourceTokenAmount("0"))},async getTokenList(){const t=f.state.activeCaipNetwork?.caipNetworkId;if(!(c.caipNetworkId===t&&c.tokens))try{c.tokensLoading=!0;const e=await je.getTokenList(t);c.tokens=e,c.caipNetworkId=t,c.popularTokens=e.sort((r,a)=>r.symbol<a.symbol?-1:r.symbol>a.symbol?1:0);const i=(t&&Ut.SUGGESTED_TOKENS_BY_CHAIN?.[t]||[]).map(r=>e.find(a=>a.symbol===r)).filter(r=>!!r),o=(Ut.SWAP_SUGGESTED_TOKENS||[]).map(r=>e.find(a=>a.symbol===r)).filter(r=>!!r).filter(r=>!i.some(a=>a.address===r.address));c.suggestedTokens=[...i,...o]}catch{c.tokens=[],c.popularTokens=[],c.suggestedTokens=[]}finally{c.tokensLoading=!1}},async getAddressPrice(t){const e=c.tokensPriceMap[t];if(e)return e;const i=(await Me.fetchTokenPrice({addresses:[t]}))?.fungibles||[],o=[...c.tokens||[],...c.myTokensWithBalance||[]]?.find(d=>d.address===t)?.symbol,r=i.find(d=>d.symbol.toLowerCase()===o?.toLowerCase())?.price||0,a=parseFloat(r.toString());return c.tokensPriceMap[t]=a,a},async getNetworkTokenPrice(){const{networkAddress:t}=w.getParams(),n=(await Me.fetchTokenPrice({addresses:[t]}).catch(()=>(C.showError("Failed to fetch network token price"),{fungibles:[]}))).fungibles?.[0],i=n?.price.toString()||"0";c.tokensPriceMap[t]=parseFloat(i),c.networkTokenSymbol=n?.symbol||"",c.networkPrice=i},async getMyTokensWithBalance(t){const e=await Bn.getMyTokensWithBalance({forceUpdate:t,caipNetwork:f.state.activeCaipNetwork,address:f.getAccountData()?.address}),n=je.mapBalancesToSwapTokens(e);n&&(await w.getInitialGasPrice(),w.setBalances(n))},setBalances(t){const{networkAddress:e}=w.getParams(),n=f.state.activeCaipNetwork;if(!n)return;const i=t.find(s=>s.address===e);t.forEach(s=>{c.tokensPriceMap[s.address]=s.price||0}),c.myTokensWithBalance=t.filter(s=>s.address.startsWith(n.caipNetworkId)),c.networkBalanceInUSD=i?k.multiply(i.quantity.numeric,i.price).toString():"0"},async getInitialGasPrice(){const t=await je.fetchGasPrice();if(!t)return{gasPrice:null,gasPriceInUSD:null};switch(f.state?.activeCaipNetwork?.chainNamespace){case U.CHAIN.SOLANA:return c.gasFee=t.standard??"0",c.gasPriceInUSD=k.multiply(t.standard,c.networkPrice).div(1e9).toNumber(),{gasPrice:BigInt(c.gasFee),gasPriceInUSD:Number(c.gasPriceInUSD)};case U.CHAIN.EVM:default:const e=t.standard??"0",n=BigInt(e),i=BigInt(dn),s=ve.getGasPriceInUSD(c.networkPrice,i,n);return c.gasFee=e,c.gasPriceInUSD=s,{gasPrice:n,gasPriceInUSD:s}}},async swapTokens(){const t=f.getAccountData()?.address,e=c.sourceToken,n=c.toToken,i=k.bigNumber(c.sourceTokenAmount).gt(0);if(i||w.setToTokenAmount(""),!n||!e||c.loadingPrices||!i||!t)return;c.loadingQuote=!0;const s=k.bigNumber(c.sourceTokenAmount).times(10**e.decimals).round(0).toFixed(0);try{const o=await Me.fetchSwapQuote({userAddress:t,from:e.address,to:n.address,gasPrice:c.gasFee,amount:s.toString()});c.loadingQuote=!1;const r=o?.quotes?.[0]?.toAmount;if(!r){qe.open({displayMessage:"Incorrect amount",debugMessage:"Please enter a valid amount"},"error");return}const a=k.bigNumber(r).div(10**n.decimals).toString();w.setToTokenAmount(a),w.hasInsufficientToken(c.sourceTokenAmount,e.address)?c.inputError="Insufficient balance":(c.inputError=void 0,w.setTransactionDetails())}catch(o){const r=await je.handleSwapError(o);c.loadingQuote=!1,c.inputError=r||"Insufficient balance"}},async getTransaction(){const{fromCaipAddress:t,availableToSwap:e}=w.getParams(),n=c.sourceToken,i=c.toToken;if(!(!t||!e||!n||!i||c.loadingQuote))try{c.loadingBuildTransaction=!0;const s=await je.fetchSwapAllowance({userAddress:t,tokenAddress:n.address,sourceTokenAmount:c.sourceTokenAmount,sourceTokenDecimals:n.decimals});let o;return s?o=await w.createSwapTransaction():o=await w.createAllowanceTransaction(),c.loadingBuildTransaction=!1,c.fetchError=!1,o}catch{m.goBack(),C.showError("Failed to check allowance"),c.loadingBuildTransaction=!1,c.approvalTransaction=void 0,c.swapTransaction=void 0,c.fetchError=!0;return}},async createAllowanceTransaction(){const{fromCaipAddress:t,sourceTokenAddress:e,toTokenAddress:n}=w.getParams();if(!(!t||!n)){if(!e)throw new Error("createAllowanceTransaction - No source token address found.");try{const i=await Me.generateApproveCalldata({from:e,to:n,userAddress:t}),s=ee.getPlainAddress(i.tx.from);if(!s)throw new Error("SwapController:createAllowanceTransaction - address is required");const o={data:i.tx.data,to:s,gasPrice:BigInt(i.tx.eip155.gasPrice),value:BigInt(i.tx.value),toAmount:c.toTokenAmount};return c.swapTransaction=void 0,c.approvalTransaction={data:o.data,to:o.to,gasPrice:o.gasPrice,value:o.value,toAmount:o.toAmount},{data:o.data,to:o.to,gasPrice:o.gasPrice,value:o.value,toAmount:o.toAmount}}catch{m.goBack(),C.showError("Failed to create approval transaction"),c.approvalTransaction=void 0,c.swapTransaction=void 0,c.fetchError=!0;return}}},async createSwapTransaction(){const{networkAddress:t,fromCaipAddress:e,sourceTokenAmount:n}=w.getParams(),i=c.sourceToken,s=c.toToken;if(!e||!n||!i||!s)return;const o=G.parseUnits(n,i.decimals)?.toString();try{const r=await Me.generateSwapCalldata({userAddress:e,from:i.address,to:s.address,amount:o,disableEstimate:!0}),a=i.address===t,d=BigInt(r.tx.eip155.gas),x=BigInt(r.tx.eip155.gasPrice),T=ee.getPlainAddress(r.tx.to);if(!T)throw new Error("SwapController:createSwapTransaction - address is required");const $={data:r.tx.data,to:T,gas:d,gasPrice:x,value:BigInt(a?o??"0":"0"),toAmount:c.toTokenAmount};return c.gasPriceInUSD=ve.getGasPriceInUSD(c.networkPrice,d,x),c.approvalTransaction=void 0,c.swapTransaction=$,$}catch{m.goBack(),C.showError("Failed to create transaction"),c.approvalTransaction=void 0,c.swapTransaction=void 0,c.fetchError=!0;return}},onEmbeddedWalletApprovalSuccess(){C.showLoading("Approve limit increase in your wallet"),m.replace("SwapPreview")},async sendTransactionForApproval(t){const{fromAddress:e,isAuthConnector:n}=w.getParams();c.loadingApprovalTransaction=!0,n?m.pushTransactionStack({onSuccess:w.onEmbeddedWalletApprovalSuccess}):C.showLoading("Approve limit increase in your wallet");try{await G.sendTransaction({address:e,to:t.to,data:t.data,value:t.value,chainNamespace:U.CHAIN.EVM}),await w.swapTokens(),await w.getTransaction(),c.approvalTransaction=void 0,c.loadingApprovalTransaction=!1}catch(s){const o=s;c.transactionError=o?.displayMessage,c.loadingApprovalTransaction=!1,C.showError(o?.displayMessage||"Transaction error"),K.sendEvent({type:"track",event:"SWAP_APPROVAL_ERROR",properties:{message:o?.displayMessage||o?.message||"Unknown",network:f.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:w.state.sourceToken?.symbol||"",swapToToken:w.state.toToken?.symbol||"",swapFromAmount:w.state.sourceTokenAmount||"",swapToAmount:w.state.toTokenAmount||"",isSmartAccount:dt(U.CHAIN.EVM)===pt.ACCOUNT_TYPES.SMART_ACCOUNT}})}},async sendTransactionForSwap(t){if(!t)return;const{fromAddress:e,toTokenAmount:n,isAuthConnector:i}=w.getParams();c.loadingTransaction=!0;const s=`Swapping ${c.sourceToken?.symbol} to ${k.formatNumberToLocalString(n,3)} ${c.toToken?.symbol}`,o=`Swapped ${c.sourceToken?.symbol} to ${k.formatNumberToLocalString(n,3)} ${c.toToken?.symbol}`;i?m.pushTransactionStack({onSuccess(){m.replace("Account"),C.showLoading(s),ht.resetState()}}):C.showLoading("Confirm transaction in your wallet");try{const r=[c.sourceToken?.address,c.toToken?.address].join(","),a=await G.sendTransaction({address:e,to:t.to,data:t.data,value:t.value,chainNamespace:U.CHAIN.EVM});return c.loadingTransaction=!1,C.showSuccess(o),K.sendEvent({type:"track",event:"SWAP_SUCCESS",properties:{network:f.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:w.state.sourceToken?.symbol||"",swapToToken:w.state.toToken?.symbol||"",swapFromAmount:w.state.sourceTokenAmount||"",swapToAmount:w.state.toTokenAmount||"",isSmartAccount:dt(U.CHAIN.EVM)===pt.ACCOUNT_TYPES.SMART_ACCOUNT}}),ht.resetState(),i||m.replace("Account"),ht.getMyTokensWithBalance(r),a}catch(r){const a=r;c.transactionError=a?.displayMessage,c.loadingTransaction=!1,C.showError(a?.displayMessage||"Transaction error"),K.sendEvent({type:"track",event:"SWAP_ERROR",properties:{message:a?.displayMessage||a?.message||"Unknown",network:f.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:w.state.sourceToken?.symbol||"",swapToToken:w.state.toToken?.symbol||"",swapFromAmount:w.state.sourceTokenAmount||"",swapToAmount:w.state.toTokenAmount||"",isSmartAccount:dt(U.CHAIN.EVM)===pt.ACCOUNT_TYPES.SMART_ACCOUNT}});return}},hasInsufficientToken(t,e){return ve.isInsufficientSourceTokenForSwap(t,e,c.myTokensWithBalance)},setTransactionDetails(){const{toTokenAddress:t,toTokenDecimals:e}=w.getParams();!t||!e||(c.gasPriceInUSD=ve.getGasPriceInUSD(c.networkPrice,BigInt(c.gasFee),BigInt(dn)),c.priceImpact=ve.getPriceImpact({sourceTokenAmount:c.sourceTokenAmount,sourceTokenPriceInUSD:c.sourceTokenPriceInUSD,toTokenPriceInUSD:c.toTokenPriceInUSD,toTokenAmount:c.toTokenAmount}),c.maxSlippage=ve.getMaxSlippage(c.slippage,c.toTokenAmount),c.providerFee=ve.getProviderFee(c.sourceTokenAmount))}},w=Ln(ht),oe=Mn({message:"",open:!1,triggerRect:{width:0,height:0,top:0,left:0},variant:"shade"}),yi={state:oe,subscribe(t){return Fn(oe,()=>t(oe))},subscribeKey(t,e){return zn(oe,t,e)},showTooltip({message:t,triggerRect:e,variant:n}){oe.open=!0,oe.message=t,oe.triggerRect=e,oe.variant=n},hide(){oe.open=!1,oe.message="",oe.triggerRect={width:0,height:0,top:0,left:0}}},J=Ln(yi),qn={isUnsupportedChainView(){return m.state.view==="UnsupportedChain"||m.state.view==="SwitchNetwork"&&m.state.history.includes("UnsupportedChain")},async safeClose(){if(this.isUnsupportedChainView()){H.shake();return}if(await jn.isSIWXCloseDisabled()){H.shake();return}(m.state.view==="DataCapture"||m.state.view==="DataCaptureOtpConfirm")&&G.disconnect(),H.close()}},pn={interpolate(t,e,n){if(t.length!==2||e.length!==2)throw new Error("inputRange and outputRange must be an array of length 2");const i=t[0]||0,s=t[1]||0,o=e[0]||0,r=e[1]||0;return n<i?o:n>s?r:(r-o)/(s-i)*(n-i)+o}},bi=E`
  :host {
    display: block;
    border-radius: clamp(0px, ${({borderRadius:t})=>t[8]}, 44px);
    box-shadow: 0 0 0 1px ${({tokens:t})=>t.theme.foregroundPrimary};
    overflow: hidden;
  }
`;var vi=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let Wt=class extends he{render(){return P`<slot></slot>`}};Wt.styles=[pe,bi];Wt=vi([A("wui-card")],Wt);const xi=E`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:t})=>t[2]};
    padding: ${({spacing:t})=>t[3]};
    border-radius: ${({borderRadius:t})=>t[6]};
    border: 1px solid ${({tokens:t})=>t.theme.borderPrimary};
    box-sizing: border-box;
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.25);
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  :host > wui-flex[data-type='info'] {
    .icon-box {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};

      wui-icon {
        color: ${({tokens:t})=>t.theme.iconDefault};
      }
    }
  }
  :host > wui-flex[data-type='success'] {
    .icon-box {
      background-color: ${({tokens:t})=>t.core.backgroundSuccess};

      wui-icon {
        color: ${({tokens:t})=>t.core.borderSuccess};
      }
    }
  }
  :host > wui-flex[data-type='warning'] {
    .icon-box {
      background-color: ${({tokens:t})=>t.core.backgroundWarning};

      wui-icon {
        color: ${({tokens:t})=>t.core.borderWarning};
      }
    }
  }
  :host > wui-flex[data-type='error'] {
    .icon-box {
      background-color: ${({tokens:t})=>t.core.backgroundError};

      wui-icon {
        color: ${({tokens:t})=>t.core.borderError};
      }
    }
  }

  wui-flex {
    width: 100%;
  }

  wui-text {
    word-break: break-word;
    flex: 1;
  }

  .close {
    cursor: pointer;
    color: ${({tokens:t})=>t.theme.iconDefault};
  }

  .icon-box {
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:t})=>t[2]};
    background-color: var(--local-icon-bg-value);
  }
`;var Vt=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};const ki={info:"info",success:"checkmark",warning:"warningCircle",error:"warning"};let Ke=class extends he{constructor(){super(...arguments),this.message="",this.type="info"}render(){return P`
      <wui-flex
        data-type=${Ht(this.type)}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="2"
      >
        <wui-flex columnGap="2" flexDirection="row" alignItems="center">
          <wui-flex
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            class="icon-box"
          >
            <wui-icon color="inherit" size="md" name=${ki[this.type]}></wui-icon>
          </wui-flex>
          <wui-text variant="md-medium" color="inherit" data-testid="wui-alertbar-text"
            >${this.message}</wui-text
          >
        </wui-flex>
        <wui-icon
          class="close"
          color="inherit"
          size="sm"
          name="close"
          @click=${this.onClose}
        ></wui-icon>
      </wui-flex>
    `}onClose(){qe.close()}};Ke.styles=[pe,xi];Vt([y()],Ke.prototype,"message",void 0);Vt([y()],Ke.prototype,"type",void 0);Ke=Vt([A("wui-alertbar")],Ke);const Ai=E`
  :host {
    display: block;
    position: absolute;
    top: ${({spacing:t})=>t[3]};
    left: ${({spacing:t})=>t[4]};
    right: ${({spacing:t})=>t[4]};
    opacity: 0;
    pointer-events: none;
  }
`;var Vn=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};const $i={info:{backgroundColor:"fg-350",iconColor:"fg-325",icon:"info"},success:{backgroundColor:"success-glass-reown-020",iconColor:"success-125",icon:"checkmark"},warning:{backgroundColor:"warning-glass-reown-020",iconColor:"warning-100",icon:"warningCircle"},error:{backgroundColor:"error-glass-reown-020",iconColor:"error-125",icon:"warning"}};let wt=class extends Y{constructor(){super(),this.unsubscribe=[],this.open=qe.state.open,this.onOpen(!0),this.unsubscribe.push(qe.subscribeKey("open",e=>{this.open=e,this.onOpen(!1)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const{message:e,variant:n}=qe.state,i=$i[n];return u`
      <wui-alertbar
        message=${e}
        backgroundColor=${i?.backgroundColor}
        iconColor=${i?.iconColor}
        icon=${i?.icon}
        type=${n}
      ></wui-alertbar>
    `}onOpen(e){this.open?(this.animate([{opacity:0,transform:"scale(0.85)"},{opacity:1,transform:"scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: auto"):e||(this.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: none")}};wt.styles=Ai;Vn([S()],wt.prototype,"open",void 0);wt=Vn([A("w3m-alertbar")],wt);const Si=E`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:t})=>t[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:t})=>t.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:t})=>t.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:t})=>t.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:t})=>t.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:t})=>t.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:t})=>t[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:t})=>t[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:t})=>t.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:t})=>t.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:t})=>t.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var Te=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let le=class extends he{constructor(){super(...arguments),this.icon="card",this.variant="primary",this.type="accent",this.size="md",this.iconSize=void 0,this.fullWidth=!1,this.disabled=!1}render(){return P`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${Ht(this.iconSize)}></wui-icon>
    </button>`}};le.styles=[pe,Tt,Si];Te([y()],le.prototype,"icon",void 0);Te([y()],le.prototype,"variant",void 0);Te([y()],le.prototype,"type",void 0);Te([y()],le.prototype,"size",void 0);Te([y()],le.prototype,"iconSize",void 0);Te([y({type:Boolean})],le.prototype,"fullWidth",void 0);Te([y({type:Boolean})],le.prototype,"disabled",void 0);le=Te([A("wui-icon-button")],le);const Ti=E`
  button {
    display: block;
    display: flex;
    align-items: center;
    padding: ${({spacing:t})=>t[1]};
    transition: background-color ${({durations:t})=>t.lg}
      ${({easings:t})=>t["ease-out-power-2"]};
    will-change: background-color;
    border-radius: ${({borderRadius:t})=>t[32]};
  }

  wui-image {
    border-radius: 100%;
  }

  wui-text {
    padding-left: ${({spacing:t})=>t[1]};
  }

  .left-icon-container,
  .right-icon-container {
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
  }

  wui-icon {
    color: ${({tokens:t})=>t.theme.iconDefault};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='lg'] {
    height: 32px;
  }

  button[data-size='md'] {
    height: 28px;
  }

  button[data-size='sm'] {
    height: 24px;
  }

  button[data-size='lg'] wui-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] .left-icon-container {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] .left-icon-container {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] .left-icon-container {
    width: 16px;
    height: 16px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-type='filled-dropdown'] {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  button[data-type='text-dropdown'] {
    background-color: transparent;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent040};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    opacity: 0.5;
  }
`;var Be=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};const Ei={lg:"lg-regular",md:"md-regular",sm:"sm-regular"},Ci={lg:"lg",md:"md",sm:"sm"};let Ae=class extends he{constructor(){super(...arguments),this.imageSrc="",this.text="",this.size="lg",this.type="text-dropdown",this.disabled=!1}render(){return P`<button ?disabled=${this.disabled} data-size=${this.size} data-type=${this.type}>
      ${this.imageTemplate()} ${this.textTemplate()}
      <wui-flex class="right-icon-container">
        <wui-icon name="chevronBottom"></wui-icon>
      </wui-flex>
    </button>`}textTemplate(){const e=Ei[this.size];return this.text?P`<wui-text color="primary" variant=${e}>${this.text}</wui-text>`:null}imageTemplate(){if(this.imageSrc)return P`<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`;const e=Ci[this.size];return P` <wui-flex class="left-icon-container">
      <wui-icon size=${e} name="networkPlaceholder"></wui-icon>
    </wui-flex>`}};Ae.styles=[pe,Tt,Ti];Be([y()],Ae.prototype,"imageSrc",void 0);Be([y()],Ae.prototype,"text",void 0);Be([y()],Ae.prototype,"size",void 0);Be([y()],Ae.prototype,"type",void 0);Be([y({type:Boolean})],Ae.prototype,"disabled",void 0);Ae=Be([A("wui-select")],Ae);const Ie={ACCOUNT_TABS:[{label:"Tokens"},{label:"Activity"}],VIEW_DIRECTION:{Next:"next",Prev:"prev"},ANIMATION_DURATIONS:{HeaderText:120},VIEWS_WITH_LEGAL_FOOTER:["Connect","ConnectWallets","OnRampTokenSelect","OnRampFiatSelect","OnRampProviders"],VIEWS_WITH_DEFAULT_FOOTER:["Networks"]};/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const mt=globalThis,Gt=mt.ShadowRoot&&(mt.ShadyCSS===void 0||mt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Yt=Symbol(),hn=new WeakMap;let Gn=class{constructor(e,n,i){if(this._$cssResult$=!0,i!==Yt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=n}get styleSheet(){let e=this.o;const n=this.t;if(Gt&&e===void 0){const i=n!==void 0&&n.length===1;i&&(e=hn.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&hn.set(n,e))}return e}toString(){return this.cssText}};const Pi=t=>new Gn(typeof t=="string"?t:t+"",void 0,Yt),Ii=(t,...e)=>{const n=t.length===1?t[0]:e.reduce((i,s,o)=>i+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new Gn(n,t,Yt)},_i=(t,e)=>{if(Gt)t.adoptedStyleSheets=e.map(n=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(const n of e){const i=document.createElement("style"),s=mt.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=n.cssText,t.appendChild(i)}},mn=Gt?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let n="";for(const i of e.cssRules)n+=i.cssText;return Pi(n)})(t):t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Ni,defineProperty:Ri,getOwnPropertyDescriptor:Oi,getOwnPropertyNames:Ui,getOwnPropertySymbols:Wi,getPrototypeOf:Di}=Object,Et=globalThis,wn=Et.trustedTypes,Li=wn?wn.emptyScript:"",Bi=Et.reactiveElementPolyfillSupport,Ve=(t,e)=>t,ft={toAttribute(t,e){switch(e){case Boolean:t=t?Li:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let n=t;switch(e){case Boolean:n=t!==null;break;case Number:n=t===null?null:Number(t);break;case Object:case Array:try{n=JSON.parse(t)}catch{n=null}}return n}},Kt=(t,e)=>!Ni(t,e),fn={attribute:!0,type:String,converter:ft,reflect:!1,useDefault:!1,hasChanged:Kt};Symbol.metadata??=Symbol("metadata"),Et.litPropertyMetadata??=new WeakMap;let We=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,n=fn){if(n.state&&(n.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((n=Object.create(n)).wrapped=!0),this.elementProperties.set(e,n),!n.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,n);s!==void 0&&Ri(this.prototype,e,s)}}static getPropertyDescriptor(e,n,i){const{get:s,set:o}=Oi(this.prototype,e)??{get(){return this[n]},set(r){this[n]=r}};return{get:s,set(r){const a=s?.call(this);o?.call(this,r),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??fn}static _$Ei(){if(this.hasOwnProperty(Ve("elementProperties")))return;const e=Di(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Ve("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Ve("properties"))){const n=this.properties,i=[...Ui(n),...Wi(n)];for(const s of i)this.createProperty(s,n[s])}const e=this[Symbol.metadata];if(e!==null){const n=litPropertyMetadata.get(e);if(n!==void 0)for(const[i,s]of n)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[n,i]of this.elementProperties){const s=this._$Eu(n,i);s!==void 0&&this._$Eh.set(s,n)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const n=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)n.unshift(mn(s))}else e!==void 0&&n.push(mn(e));return n}static _$Eu(e,n){const i=n.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,n=this.constructor.elementProperties;for(const i of n.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return _i(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,n,i){this._$AK(e,i)}_$ET(e,n){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){const o=(i.converter?.toAttribute!==void 0?i.converter:ft).toAttribute(n,i.type);this._$Em=e,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,n){const i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const o=i.getPropertyOptions(s),r=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:ft;this._$Em=s;const a=r.fromAttribute(n,o.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(e,n,i,s=!1,o){if(e!==void 0){const r=this.constructor;if(s===!1&&(o=this[e]),i??=r.getPropertyOptions(e),!((i.hasChanged??Kt)(o,n)||i.useDefault&&i.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,i))))return;this.C(e,n,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,n,{useDefault:i,reflect:s,wrapped:o},r){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??n??this[e]),o!==!0||r!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(n=void 0),this._$AL.set(e,n)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(n){Promise.reject(n)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[s,o]of i){const{wrapped:r}=o,a=this[s];r!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,o,a)}}let e=!1;const n=this._$AL;try{e=this.shouldUpdate(n),e?(this.willUpdate(n),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(n)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(n)}willUpdate(e){}_$AE(e){this._$EO?.forEach(n=>n.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(n=>this._$ET(n,this[n])),this._$EM()}updated(e){}firstUpdated(e){}};We.elementStyles=[],We.shadowRootOptions={mode:"open"},We[Ve("elementProperties")]=new Map,We[Ve("finalized")]=new Map,Bi?.({ReactiveElement:We}),(Et.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Qt=globalThis,gn=t=>t,gt=Qt.trustedTypes,yn=gt?gt.createPolicy("lit-html",{createHTML:t=>t}):void 0,Yn="$lit$",ke=`lit$${Math.random().toFixed(9).slice(2)}$`,Kn="?"+ke,zi=`<${Kn}>`,Ne=document,Qe=()=>Ne.createComment(""),Xe=t=>t===null||typeof t!="object"&&typeof t!="function",Xt=Array.isArray,Fi=t=>Xt(t)||typeof t?.[Symbol.iterator]=="function",It=`[ 	
\f\r]`,He=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,bn=/-->/g,vn=/>/g,Pe=RegExp(`>|${It}(?:([^\\s"'>=/]+)(${It}*=${It}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),xn=/'/g,kn=/"/g,Qn=/^(?:script|style|textarea|title)$/i,Mi=t=>(e,...n)=>({_$litType$:t,strings:e,values:n}),h=Mi(1),Re=Symbol.for("lit-noChange"),L=Symbol.for("lit-nothing"),An=new WeakMap,_e=Ne.createTreeWalker(Ne,129);function Xn(t,e){if(!Xt(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return yn!==void 0?yn.createHTML(e):e}const ji=(t,e)=>{const n=t.length-1,i=[];let s,o=e===2?"<svg>":e===3?"<math>":"",r=He;for(let a=0;a<n;a++){const d=t[a];let x,T,$=-1,V=0;for(;V<d.length&&(r.lastIndex=V,T=r.exec(d),T!==null);)V=r.lastIndex,r===He?T[1]==="!--"?r=bn:T[1]!==void 0?r=vn:T[2]!==void 0?(Qn.test(T[2])&&(s=RegExp("</"+T[2],"g")),r=Pe):T[3]!==void 0&&(r=Pe):r===Pe?T[0]===">"?(r=s??He,$=-1):T[1]===void 0?$=-2:($=r.lastIndex-T[2].length,x=T[1],r=T[3]===void 0?Pe:T[3]==='"'?kn:xn):r===kn||r===xn?r=Pe:r===bn||r===vn?r=He:(r=Pe,s=void 0);const Z=r===Pe&&t[a+1].startsWith("/>")?" ":"";o+=r===He?d+zi:$>=0?(i.push(x),d.slice(0,$)+Yn+d.slice($)+ke+Z):d+ke+($===-2?a:Z)}return[Xn(t,o+(t[n]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class Ze{constructor({strings:e,_$litType$:n},i){let s;this.parts=[];let o=0,r=0;const a=e.length-1,d=this.parts,[x,T]=ji(e,n);if(this.el=Ze.createElement(x,i),_e.currentNode=this.el.content,n===2||n===3){const $=this.el.content.firstChild;$.replaceWith(...$.childNodes)}for(;(s=_e.nextNode())!==null&&d.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(const $ of s.getAttributeNames())if($.endsWith(Yn)){const V=T[r++],Z=s.getAttribute($).split(ke),ge=/([.?@])?(.*)/.exec(V);d.push({type:1,index:o,name:ge[2],strings:Z,ctor:ge[1]==="."?qi:ge[1]==="?"?Vi:ge[1]==="@"?Gi:Ct}),s.removeAttribute($)}else $.startsWith(ke)&&(d.push({type:6,index:o}),s.removeAttribute($));if(Qn.test(s.tagName)){const $=s.textContent.split(ke),V=$.length-1;if(V>0){s.textContent=gt?gt.emptyScript:"";for(let Z=0;Z<V;Z++)s.append($[Z],Qe()),_e.nextNode(),d.push({type:2,index:++o});s.append($[V],Qe())}}}else if(s.nodeType===8)if(s.data===Kn)d.push({type:2,index:o});else{let $=-1;for(;($=s.data.indexOf(ke,$+1))!==-1;)d.push({type:7,index:o}),$+=ke.length-1}o++}}static createElement(e,n){const i=Ne.createElement("template");return i.innerHTML=e,i}}function De(t,e,n=t,i){if(e===Re)return e;let s=i!==void 0?n._$Co?.[i]:n._$Cl;const o=Xe(e)?void 0:e._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(t),s._$AT(t,n,i)),i!==void 0?(n._$Co??=[])[i]=s:n._$Cl=s),s!==void 0&&(e=De(t,s._$AS(t,e.values),s,i)),e}class Hi{constructor(e,n){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=n}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:n},parts:i}=this._$AD,s=(e?.creationScope??Ne).importNode(n,!0);_e.currentNode=s;let o=_e.nextNode(),r=0,a=0,d=i[0];for(;d!==void 0;){if(r===d.index){let x;d.type===2?x=new st(o,o.nextSibling,this,e):d.type===1?x=new d.ctor(o,d.name,d.strings,this,e):d.type===6&&(x=new Yi(o,this,e)),this._$AV.push(x),d=i[++a]}r!==d?.index&&(o=_e.nextNode(),r++)}return _e.currentNode=Ne,s}p(e){let n=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,n),n+=i.strings.length-2):i._$AI(e[n])),n++}}class st{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,n,i,s){this.type=2,this._$AH=L,this._$AN=void 0,this._$AA=e,this._$AB=n,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const n=this._$AM;return n!==void 0&&e?.nodeType===11&&(e=n.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,n=this){e=De(this,e,n),Xe(e)?e===L||e==null||e===""?(this._$AH!==L&&this._$AR(),this._$AH=L):e!==this._$AH&&e!==Re&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Fi(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==L&&Xe(this._$AH)?this._$AA.nextSibling.data=e:this.T(Ne.createTextNode(e)),this._$AH=e}$(e){const{values:n,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=Ze.createElement(Xn(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(n);else{const o=new Hi(s,this),r=o.u(this.options);o.p(n),this.T(r),this._$AH=o}}_$AC(e){let n=An.get(e.strings);return n===void 0&&An.set(e.strings,n=new Ze(e)),n}k(e){Xt(this._$AH)||(this._$AH=[],this._$AR());const n=this._$AH;let i,s=0;for(const o of e)s===n.length?n.push(i=new st(this.O(Qe()),this.O(Qe()),this,this.options)):i=n[s],i._$AI(o),s++;s<n.length&&(this._$AR(i&&i._$AB.nextSibling,s),n.length=s)}_$AR(e=this._$AA.nextSibling,n){for(this._$AP?.(!1,!0,n);e!==this._$AB;){const i=gn(e).nextSibling;gn(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class Ct{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,n,i,s,o){this.type=1,this._$AH=L,this._$AN=void 0,this.element=e,this.name=n,this._$AM=s,this.options=o,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=L}_$AI(e,n=this,i,s){const o=this.strings;let r=!1;if(o===void 0)e=De(this,e,n,0),r=!Xe(e)||e!==this._$AH&&e!==Re,r&&(this._$AH=e);else{const a=e;let d,x;for(e=o[0],d=0;d<o.length-1;d++)x=De(this,a[i+d],n,d),x===Re&&(x=this._$AH[d]),r||=!Xe(x)||x!==this._$AH[d],x===L?e=L:e!==L&&(e+=(x??"")+o[d+1]),this._$AH[d]=x}r&&!s&&this.j(e)}j(e){e===L?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class qi extends Ct{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===L?void 0:e}}class Vi extends Ct{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==L)}}class Gi extends Ct{constructor(e,n,i,s,o){super(e,n,i,s,o),this.type=5}_$AI(e,n=this){if((e=De(this,e,n,0)??L)===Re)return;const i=this._$AH,s=e===L&&i!==L||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==L&&(i===L||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Yi{constructor(e,n,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=n,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){De(this,e)}}const Ki=Qt.litHtmlPolyfillSupport;Ki?.(Ze,st),(Qt.litHtmlVersions??=[]).push("3.3.3");const Qi=(t,e,n)=>{const i=n?.renderBefore??e;let s=i._$litPart$;if(s===void 0){const o=n?.renderBefore??null;i._$litPart$=s=new st(e.insertBefore(Qe(),o),o,void 0,n??{})}return s._$AI(t),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Zt=globalThis;let te=class extends We{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const n=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Qi(n,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Re}};te._$litElement$=!0,te.finalized=!0,Zt.litElementHydrateSupport?.({LitElement:te});const Xi=Zt.litElementPolyfillSupport;Xi?.({LitElement:te});(Zt.litElementVersions??=[]).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Zi={attribute:!0,type:String,converter:ft,reflect:!1,hasChanged:Kt},Ji=(t=Zi,e,n)=>{const{kind:i,metadata:s}=n;let o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),i==="setter"&&((t=Object.create(t)).wrapped=!0),o.set(n.name,t),i==="accessor"){const{name:r}=n;return{set(a){const d=e.get.call(this);e.set.call(this,a),this.requestUpdate(r,d,t,!0,a)},init(a){return a!==void 0&&this.C(r,void 0,t,a),a}}}if(i==="setter"){const{name:r}=n;return function(a){const d=this[r];e.call(this,a),this.requestUpdate(r,d,t,!0,a)}}throw Error("Unsupported decorator location: "+i)};function rt(t){return(e,n)=>typeof n=="object"?Ji(t,e,n):((i,s,o)=>{const r=s.hasOwnProperty(o);return s.constructor.createProperty(o,i),r?Object.getOwnPropertyDescriptor(s,o):void 0})(t,e,n)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function v(t){return rt({...t,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const O=t=>t??L,eo=E`
  button {
    background-color: transparent;
    padding: ${({spacing:t})=>t[1]};
  }

  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent020};
  }

  button[data-variant='accent']:hover:enabled,
  button[data-variant='accent']:focus-visible {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  button[data-variant='primary']:hover:enabled,
  button[data-variant='primary']:focus-visible,
  button[data-variant='secondary']:hover:enabled,
  button[data-variant='secondary']:focus-visible {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  button[data-size='xs'] > wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] > wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='xs'],
  button[data-size='sm'] {
    border-radius: ${({borderRadius:t})=>t[1]};
  }

  button[data-size='md'],
  button[data-size='lg'] {
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  button[data-size='md'] > wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] > wui-icon {
    width: 20px;
    height: 20px;
  }

  button:disabled {
    background-color: transparent;
    cursor: not-allowed;
    opacity: 0.5;
  }

  button:hover:not(:disabled) {
    background-color: var(--wui-color-accent-glass-015);
  }

  button:focus-visible:not(:disabled) {
    background-color: var(--wui-color-accent-glass-015);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
`;var ze=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let $e=class extends he{constructor(){super(...arguments),this.size="md",this.disabled=!1,this.icon="copy",this.iconColor="default",this.variant="accent"}render(){const e={accent:"accent-primary",primary:"inverse",secondary:"default"};return P`
      <button data-variant=${this.variant} ?disabled=${this.disabled} data-size=${this.size}>
        <wui-icon
          color=${e[this.variant]||this.iconColor}
          size=${this.size}
          name=${this.icon}
        ></wui-icon>
      </button>
    `}};$e.styles=[pe,Tt,eo];ze([y()],$e.prototype,"size",void 0);ze([y({type:Boolean})],$e.prototype,"disabled",void 0);ze([y()],$e.prototype,"icon",void 0);ze([y()],$e.prototype,"iconColor",void 0);ze([y()],$e.prototype,"variant",void 0);$e=ze([A("wui-icon-link")],$e);const to=Hn`<svg width="86" height="96" fill="none">
  <path
    d="M78.3244 18.926L50.1808 2.45078C45.7376 -0.150261 40.2624 -0.150262 35.8192 2.45078L7.6756 18.926C3.23322 21.5266 0.5 26.3301 0.5 31.5248V64.4752C0.5 69.6699 3.23322 74.4734 7.6756 77.074L35.8192 93.5492C40.2624 96.1503 45.7376 96.1503 50.1808 93.5492L78.3244 77.074C82.7668 74.4734 85.5 69.6699 85.5 64.4752V31.5248C85.5 26.3301 82.7668 21.5266 78.3244 18.926Z"
  />
</svg>`,no=Hn`
  <svg fill="none" viewBox="0 0 36 40">
    <path
      d="M15.4 2.1a5.21 5.21 0 0 1 5.2 0l11.61 6.7a5.21 5.21 0 0 1 2.61 4.52v13.4c0 1.87-1 3.59-2.6 4.52l-11.61 6.7c-1.62.93-3.6.93-5.22 0l-11.6-6.7a5.21 5.21 0 0 1-2.61-4.51v-13.4c0-1.87 1-3.6 2.6-4.52L15.4 2.1Z"
    />
  </svg>
`,io=E`
  :host {
    position: relative;
    border-radius: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--local-width);
    height: var(--local-height);
  }

  :host([data-round='true']) {
    background: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-radius: 100%;
    outline: 1px solid ${({tokens:t})=>t.core.glass010};
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  svg > path {
    stroke: var(--local-stroke);
  }

  wui-image {
    width: 100%;
    height: 100%;
    -webkit-clip-path: var(--local-path);
    clip-path: var(--local-path);
    background: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  wui-icon {
    transform: translateY(-5%);
    width: var(--local-icon-size);
    height: var(--local-icon-size);
  }
`;var Ue=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let be=class extends he{constructor(){super(...arguments),this.size="md",this.name="uknown",this.networkImagesBySize={sm:no,md:ci,lg:to},this.selected=!1,this.round=!1}render(){const e={sm:"4",md:"6",lg:"10"};return this.round?(this.dataset.round="true",this.style.cssText=`
      --local-width: var(--apkt-spacing-10);
      --local-height: var(--apkt-spacing-10);
      --local-icon-size: var(--apkt-spacing-4);
    `):this.style.cssText=`

      --local-path: var(--apkt-path-network-${this.size});
      --local-width:  var(--apkt-width-network-${this.size});
      --local-height:  var(--apkt-height-network-${this.size});
      --local-icon-size:  var(--apkt-spacing-${e[this.size]});
    `,P`${this.templateVisual()} ${this.svgTemplate()} `}svgTemplate(){return this.round?null:this.networkImagesBySize[this.size]}templateVisual(){return this.imageSrc?P`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`:P`<wui-icon size="inherit" color="default" name="networkPlaceholder"></wui-icon>`}};be.styles=[pe,io];Ue([y()],be.prototype,"size",void 0);Ue([y()],be.prototype,"name",void 0);Ue([y({type:Object})],be.prototype,"networkImagesBySize",void 0);Ue([y()],be.prototype,"imageSrc",void 0);Ue([y({type:Boolean})],be.prototype,"selected",void 0);Ue([y({type:Boolean})],be.prototype,"round",void 0);be=Ue([A("wui-network-image")],be);const oo=E`
  :host {
    position: relative;
    display: flex;
    width: 100%;
    height: 1px;
    background-color: ${({tokens:t})=>t.theme.borderPrimary};
    justify-content: center;
    align-items: center;
  }

  :host > wui-text {
    position: absolute;
    padding: 0px 8px;
    transition: background-color ${({durations:t})=>t.lg}
      ${({easings:t})=>t["ease-out-power-2"]};
    will-change: background-color;
  }

  :host([data-bg-color='primary']) > wui-text {
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
  }

  :host([data-bg-color='secondary']) > wui-text {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }
`;var Jt=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let Je=class extends he{constructor(){super(...arguments),this.text="",this.bgColor="primary"}render(){return this.dataset.bgColor=this.bgColor,P`${this.template()}`}template(){return this.text?P`<wui-text variant="md-regular" color="secondary">${this.text}</wui-text>`:null}};Je.styles=[pe,oo];Jt([y()],Je.prototype,"text",void 0);Jt([y()],Je.prototype,"bgColor",void 0);Je=Jt([A("wui-separator")],Je);const so=Symbol(),$n=Object.getPrototypeOf,Sn=new WeakMap,ro=t=>t&&(Sn.has(t)?Sn.get(t):$n(t)===Object.prototype||$n(t)===Array.prototype),ao=t=>ro(t)&&t[so]||null,Dt={},en=t=>typeof t=="object"&&t!==null,co=t=>en(t)&&!Zn.has(t)&&(Array.isArray(t)||!(Symbol.iterator in t))&&!(t instanceof WeakMap)&&!(t instanceof WeakSet)&&!(t instanceof Error)&&!(t instanceof Number)&&!(t instanceof Date)&&!(t instanceof String)&&!(t instanceof RegExp)&&!(t instanceof ArrayBuffer)&&!(t instanceof Promise),lo=(t,e,n,i)=>({deleteProperty(s,o){const r=Reflect.get(s,o);n(o);const a=Reflect.deleteProperty(s,o);return a&&i(["delete",[o],r]),a},set(s,o,r,a){const d=!t()&&Reflect.has(s,o),x=Reflect.get(s,o,a);if(d&&(Tn(x,r)||bt.has(r)&&Tn(x,bt.get(r))))return!0;n(o),en(r)&&(r=ao(r)||r);const T=!yt.has(r)&&po(r)?Jn(r):r;return e(o,T),Reflect.set(s,o,T,a),i(["set",[o],r,x]),!0}}),yt=new WeakMap,Zn=new WeakSet,_t=[1],bt=new WeakMap;let Tn=Object.is,uo=(t,e)=>new Proxy(t,e),po=co,ho=lo;function Jn(t={}){if(!en(t))throw new Error("object required");const e=bt.get(t);if(e)return e;let n=_t[0];const i=new Set,s=(_,F=++_t[0])=>{n!==F&&(o=n=F,i.forEach(R=>R(_,F)))};let o=n;const r=(_=_t[0])=>(o!==_&&(o=_,d.forEach(([F])=>{const R=F[1](_);R>n&&(n=R)})),n),a=_=>(F,R)=>{const ce=[...F];ce[1]=[_,...ce[1]],s(ce,R)},d=new Map,x=(_,F)=>{const R=!Zn.has(F)&&yt.get(F);if(R){if((Dt?"production":void 0)!=="production"&&d.has(_))throw new Error("prop listener already exists");if(i.size){const ce=R[2](a(_));d.set(_,[R,ce])}else d.set(_,[R])}},T=_=>{var F;const R=d.get(_);R&&(d.delete(_),(F=R[1])==null||F.call(R))},$=_=>(i.add(_),i.size===1&&d.forEach(([R,ce],ct)=>{if((Dt?"production":void 0)!=="production"&&ce)throw new Error("remove already exists");const ai=R[2](a(ct));d.set(ct,[R,ai])}),()=>{i.delete(_),i.size===0&&d.forEach(([R,ce],ct)=>{ce&&(ce(),d.set(ct,[R]))})});let V=!0;const Z=ho(()=>V,x,T,s),ge=uo(t,Z);bt.set(t,ge);const ri=[t,r,$];return yt.set(ge,ri),Reflect.ownKeys(t).forEach(_=>{const F=Object.getOwnPropertyDescriptor(t,_);"value"in F&&F.writable&&(ge[_]=t[_])}),V=!1,ge}function ei(t,e,n){const i=yt.get(t);(Dt?"production":void 0)!=="production"&&!i&&console.warn("Please use proxy object");let s;const o=[],r=i[2];let a=!1;const x=r(T=>{o.push(T),s||(s=Promise.resolve().then(()=>{s=void 0,a&&e(o.splice(0))}))});return a=!0,()=>{a=!1,x()}}function mo(t,e,n,i){let s=t[e];return ei(t,()=>{const o=t[e];Object.is(s,o)||n(s=o)})}const g={INVALID_PAYMENT_CONFIG:"INVALID_PAYMENT_CONFIG",INVALID_RECIPIENT:"INVALID_RECIPIENT",INVALID_ASSET:"INVALID_ASSET",INVALID_AMOUNT:"INVALID_AMOUNT",UNKNOWN_ERROR:"UNKNOWN_ERROR",UNABLE_TO_INITIATE_PAYMENT:"UNABLE_TO_INITIATE_PAYMENT",INVALID_CHAIN_NAMESPACE:"INVALID_CHAIN_NAMESPACE",GENERIC_PAYMENT_ERROR:"GENERIC_PAYMENT_ERROR",UNABLE_TO_GET_EXCHANGES:"UNABLE_TO_GET_EXCHANGES",ASSET_NOT_SUPPORTED:"ASSET_NOT_SUPPORTED",UNABLE_TO_GET_PAY_URL:"UNABLE_TO_GET_PAY_URL",UNABLE_TO_GET_BUY_STATUS:"UNABLE_TO_GET_BUY_STATUS",UNABLE_TO_GET_TOKEN_BALANCES:"UNABLE_TO_GET_TOKEN_BALANCES",UNABLE_TO_GET_QUOTE:"UNABLE_TO_GET_QUOTE",UNABLE_TO_GET_QUOTE_STATUS:"UNABLE_TO_GET_QUOTE_STATUS",INVALID_RECIPIENT_ADDRESS_FOR_ASSET:"INVALID_RECIPIENT_ADDRESS_FOR_ASSET"},xe={[g.INVALID_PAYMENT_CONFIG]:"Invalid payment configuration",[g.INVALID_RECIPIENT]:"Invalid recipient address",[g.INVALID_ASSET]:"Invalid asset specified",[g.INVALID_AMOUNT]:"Invalid payment amount",[g.INVALID_RECIPIENT_ADDRESS_FOR_ASSET]:"Invalid recipient address for the asset selected",[g.UNKNOWN_ERROR]:"Unknown payment error occurred",[g.UNABLE_TO_INITIATE_PAYMENT]:"Unable to initiate payment",[g.INVALID_CHAIN_NAMESPACE]:"Invalid chain namespace",[g.GENERIC_PAYMENT_ERROR]:"Unable to process payment",[g.UNABLE_TO_GET_EXCHANGES]:"Unable to get exchanges",[g.ASSET_NOT_SUPPORTED]:"Asset not supported by the selected exchange",[g.UNABLE_TO_GET_PAY_URL]:"Unable to get payment URL",[g.UNABLE_TO_GET_BUY_STATUS]:"Unable to get buy status",[g.UNABLE_TO_GET_TOKEN_BALANCES]:"Unable to get token balances",[g.UNABLE_TO_GET_QUOTE]:"Unable to get quote. Please choose a different token",[g.UNABLE_TO_GET_QUOTE_STATUS]:"Unable to get quote status"};class b extends Error{get message(){return xe[this.code]}constructor(e,n){super(xe[e]),this.name="AppKitPayError",this.code=e,this.details=n,Error.captureStackTrace&&Error.captureStackTrace(this,b)}}const wo="https://rpc.walletconnect.org/v1/json-rpc",En="reown_test";function fo(){const{chainNamespace:t}=D.parseCaipNetworkId(p.state.paymentAsset.network);if(!ee.isAddress(p.state.recipient,t))throw new b(g.INVALID_RECIPIENT_ADDRESS_FOR_ASSET,`Provide valid recipient address for namespace "${t}"`)}async function go(t,e,n){if(e!==U.CHAIN.EVM)throw new b(g.INVALID_CHAIN_NAMESPACE);if(!n.fromAddress)throw new b(g.INVALID_PAYMENT_CONFIG,"fromAddress is required for native EVM payments.");const i=typeof n.amount=="string"?parseFloat(n.amount):n.amount;if(isNaN(i))throw new b(g.INVALID_PAYMENT_CONFIG);const s=t.metadata?.decimals??18,o=G.parseUnits(i.toString(),s);if(typeof o!="bigint")throw new b(g.GENERIC_PAYMENT_ERROR);return await G.sendTransaction({chainNamespace:e,to:n.recipient,address:n.fromAddress,value:o,data:"0x"})??void 0}async function yo(t,e){if(!e.fromAddress)throw new b(g.INVALID_PAYMENT_CONFIG,"fromAddress is required for ERC20 EVM payments.");const n=t.asset,i=e.recipient,s=Number(t.metadata.decimals),o=G.parseUnits(e.amount.toString(),s);if(o===void 0)throw new b(g.GENERIC_PAYMENT_ERROR);return await G.writeContract({fromAddress:e.fromAddress,tokenAddress:n,args:[i,o],method:"transfer",abi:di.getERC20Abi(n),chainNamespace:U.CHAIN.EVM})??void 0}async function bo(t,e){if(t!==U.CHAIN.SOLANA)throw new b(g.INVALID_CHAIN_NAMESPACE);if(!e.fromAddress)throw new b(g.INVALID_PAYMENT_CONFIG,"fromAddress is required for Solana payments.");const n=typeof e.amount=="string"?parseFloat(e.amount):e.amount;if(isNaN(n)||n<=0)throw new b(g.INVALID_PAYMENT_CONFIG,"Invalid payment amount.");try{if(!ui.getProvider(t))throw new b(g.GENERIC_PAYMENT_ERROR,"No Solana provider available.");const s=await G.sendTransaction({chainNamespace:U.CHAIN.SOLANA,to:e.recipient,value:n,tokenMint:e.tokenMint});if(!s)throw new b(g.GENERIC_PAYMENT_ERROR,"Transaction failed.");return s}catch(i){throw i instanceof b?i:new b(g.GENERIC_PAYMENT_ERROR,`Solana payment failed: ${i}`)}}async function vo({sourceToken:t,toToken:e,amount:n,recipient:i}){const s=G.parseUnits(n,t.metadata.decimals),o=G.parseUnits(n,e.metadata.decimals);return Promise.resolve({type:Bt,origin:{amount:s?.toString()??"0",currency:t},destination:{amount:o?.toString()??"0",currency:e},fees:[{id:"service",label:"Service Fee",amount:"0",currency:e}],steps:[{requestId:Bt,type:"deposit",deposit:{amount:s?.toString()??"0",currency:t.asset,receiver:i}}],timeInSeconds:6})}function Lt(t){if(!t)return null;const e=t.steps[0];return!e||e.type!==Oo?null:e}function Nt(t,e=0){if(!t)return[];const n=t.steps.filter(s=>s.type===Uo),i=n.filter((s,o)=>o+1>e);return n.length>0&&n.length<3?i:[]}const tn=new pi({baseUrl:ee.getApiUrl(),clientId:null});class xo extends Error{}function ko(){const t=N.getSnapshot().projectId;return`${wo}?projectId=${t}`}function nn(){const{projectId:t,sdkType:e,sdkVersion:n}=N.state;return{projectId:t,st:e||"appkit",sv:n||"html-wagmi-4.2.2"}}async function on(t,e){const n=ko(),{sdkType:i,sdkVersion:s,projectId:o}=N.getSnapshot(),r={jsonrpc:"2.0",id:1,method:t,params:{...e||{},st:i,sv:s,projectId:o}},d=await(await fetch(n,{method:"POST",body:JSON.stringify(r),headers:{"Content-Type":"application/json"}})).json();if(d.error)throw new xo(d.error.message);return d}async function Cn(t){return(await on("reown_getExchanges",t)).result}async function Pn(t){return(await on("reown_getExchangePayUrl",t)).result}async function Ao(t){return(await on("reown_getExchangeBuyStatus",t)).result}async function $o(t){const e=k.bigNumber(t.amount).times(10**t.toToken.metadata.decimals).toString(),{chainId:n,chainNamespace:i}=D.parseCaipNetworkId(t.sourceToken.network),{chainId:s,chainNamespace:o}=D.parseCaipNetworkId(t.toToken.network),r=t.sourceToken.asset==="native"?un(i):t.sourceToken.asset,a=t.toToken.asset==="native"?un(o):t.toToken.asset;return await tn.post({path:"/appkit/v1/transfers/quote",body:{user:t.address,originChainId:n.toString(),originCurrency:r,destinationChainId:s.toString(),destinationCurrency:a,recipient:t.recipient,amount:e},params:nn()})}async function So(t){const e=se.isLowerCaseMatch(t.sourceToken.network,t.toToken.network),n=se.isLowerCaseMatch(t.sourceToken.asset,t.toToken.asset);return e&&n?vo(t):$o(t)}async function To(t){return await tn.get({path:"/appkit/v1/transfers/status",params:{requestId:t.requestId,...nn()}})}async function Eo(t){return await tn.get({path:`/appkit/v1/transfers/assets/exchanges/${t}`,params:nn()})}const Co=["eip155","solana"],Po={eip155:{native:{assetNamespace:"slip44",assetReference:"60"},defaultTokenNamespace:"erc20"},solana:{native:{assetNamespace:"slip44",assetReference:"501"},defaultTokenNamespace:"token"}},In={56:"714",204:"714"};function Rt(t,e){const{chainNamespace:n,chainId:i}=D.parseCaipNetworkId(t),s=Po[n];if(!s)throw new Error(`Unsupported chain namespace for CAIP-19 formatting: ${n}`);let o=s.native.assetNamespace,r=s.native.assetReference;return e!=="native"?(o=s.defaultTokenNamespace,r=e):n==="eip155"&&In[i]&&(r=In[i]),`${`${n}:${i}`}/${o}:${r}`}function Io(t){const{chainNamespace:e}=D.parseCaipNetworkId(t);return Co.includes(e)}function _o(t){const n=f.getAllRequestedCaipNetworks().find(s=>s.caipNetworkId===t.chainId);let i=t.address;if(!n)throw new Error(`Target network not found for balance chainId "${t.chainId}"`);if(se.isLowerCaseMatch(t.symbol,n.nativeCurrency.symbol))i="native";else if(ee.isCaipAddress(i)){const{address:s}=D.parseCaipAddress(i);i=s}else if(!i)throw new Error(`Balance address not found for balance symbol "${t.symbol}"`);return{network:n.caipNetworkId,asset:i,metadata:{name:t.name,symbol:t.symbol,decimals:Number(t.quantity.decimals),logoURI:t.iconUrl},amount:t.quantity.numeric}}function No(t){return{chainId:t.network,address:`${t.network}:${t.asset}`,symbol:t.metadata.symbol,name:t.metadata.name,iconUrl:t.metadata.logoURI||"",price:0,quantity:{numeric:"0",decimals:t.metadata.decimals.toString()}}}function vt(t){const e=k.bigNumber(t,{safe:!0});return e.lt(.001)?"<0.001":e.round(4).toString()}function Ro(t){const n=f.getAllRequestedCaipNetworks().find(i=>i.caipNetworkId===t.network);return n?!!n.testnet:!1}const _n=0,Ot="unknown",Bt="direct-transfer",Oo="deposit",Uo="transaction",l=Jn({paymentAsset:{network:"eip155:1",asset:"0x0",metadata:{name:"0x0",symbol:"0x0",decimals:0}},recipient:"0x0",amount:0,isConfigured:!1,error:null,isPaymentInProgress:!1,exchanges:[],isLoading:!1,openInNewTab:!0,redirectUrl:void 0,payWithExchange:void 0,currentPayment:void 0,analyticsSet:!1,paymentId:void 0,choice:"pay",tokenBalances:{[U.CHAIN.EVM]:[],[U.CHAIN.SOLANA]:[]},isFetchingTokenBalances:!1,selectedPaymentAsset:null,quote:void 0,quoteStatus:"waiting",quoteError:null,isFetchingQuote:!1,selectedExchange:void 0,exchangeUrlForQuote:void 0,requestId:void 0}),p={state:l,subscribe(t){return ei(l,()=>t(l))},subscribeKey(t,e){return mo(l,t,e)},async handleOpenPay(t){this.resetState(),this.setPaymentConfig(t),this.initializeAnalytics(),fo(),await this.prepareTokenLogo(),l.isConfigured=!0,K.sendEvent({type:"track",event:"PAY_MODAL_OPEN",properties:{exchanges:l.exchanges,configuration:{network:l.paymentAsset.network,asset:l.paymentAsset.asset,recipient:l.recipient,amount:l.amount}}}),await H.open({view:"Pay"})},resetState(){l.paymentAsset={network:"eip155:1",asset:"0x0",metadata:{name:"0x0",symbol:"0x0",decimals:0}},l.recipient="0x0",l.amount=0,l.isConfigured=!1,l.error=null,l.isPaymentInProgress=!1,l.isLoading=!1,l.currentPayment=void 0,l.selectedExchange=void 0,l.exchangeUrlForQuote=void 0,l.requestId=void 0},resetQuoteState(){l.quote=void 0,l.quoteStatus="waiting",l.quoteError=null,l.isFetchingQuote=!1,l.requestId=void 0},setPaymentConfig(t){if(!t.paymentAsset)throw new b(g.INVALID_PAYMENT_CONFIG);try{l.choice=t.choice??"pay",l.paymentAsset=t.paymentAsset,l.recipient=t.recipient,l.amount=t.amount,l.openInNewTab=t.openInNewTab??!0,l.redirectUrl=t.redirectUrl,l.payWithExchange=t.payWithExchange,l.error=null}catch(e){throw new b(g.INVALID_PAYMENT_CONFIG,e.message)}},setSelectedPaymentAsset(t){l.selectedPaymentAsset=t},setSelectedExchange(t){l.selectedExchange=t},setRequestId(t){l.requestId=t},setPaymentInProgress(t){l.isPaymentInProgress=t},getPaymentAsset(){return l.paymentAsset},getExchanges(){return l.exchanges},async fetchExchanges(){try{l.isLoading=!0;const t=await Cn({page:_n});l.exchanges=t.exchanges.slice(0,2)}catch{throw C.showError(xe.UNABLE_TO_GET_EXCHANGES),new b(g.UNABLE_TO_GET_EXCHANGES)}finally{l.isLoading=!1}},async getAvailableExchanges(t){try{const e=t?.asset&&t?.network?Rt(t.network,t.asset):void 0;return await Cn({page:t?.page??_n,asset:e,amount:t?.amount?.toString()})}catch{throw new b(g.UNABLE_TO_GET_EXCHANGES)}},async getPayUrl(t,e,n=!1){try{const i=Number(e.amount),s=await Pn({exchangeId:t,asset:Rt(e.network,e.asset),amount:i.toString(),recipient:`${e.network}:${e.recipient}`});return K.sendEvent({type:"track",event:"PAY_EXCHANGE_SELECTED",properties:{source:"pay",exchange:{id:t},configuration:{network:e.network,asset:e.asset,recipient:e.recipient,amount:i},currentPayment:{type:"exchange",exchangeId:t},headless:n}}),n&&(this.initiatePayment(),K.sendEvent({type:"track",event:"PAY_INITIATED",properties:{source:"pay",paymentId:l.paymentId||Ot,configuration:{network:e.network,asset:e.asset,recipient:e.recipient,amount:i},currentPayment:{type:"exchange",exchangeId:t}}})),s}catch(i){throw i instanceof Error&&i.message.includes("is not supported")?new b(g.ASSET_NOT_SUPPORTED):new Error(i.message)}},async generateExchangeUrlForQuote({exchangeId:t,paymentAsset:e,amount:n,recipient:i}){const s=await Pn({exchangeId:t,asset:Rt(e.network,e.asset),amount:n.toString(),recipient:i});l.exchangeSessionId=s.sessionId,l.exchangeUrlForQuote=s.url},async openPayUrl(t,e,n=!1){try{const i=await this.getPayUrl(t.exchangeId,e,n);if(!i)throw new b(g.UNABLE_TO_GET_PAY_URL);const o=t.openInNewTab??!0?"_blank":"_self";return ee.openHref(i.url,o),i}catch(i){throw i instanceof b?l.error=i.message:l.error=xe.GENERIC_PAYMENT_ERROR,new b(g.UNABLE_TO_GET_PAY_URL)}},async onTransfer({chainNamespace:t,fromAddress:e,toAddress:n,amount:i,paymentAsset:s}){if(l.currentPayment={type:"wallet",status:"IN_PROGRESS"},!l.isPaymentInProgress)try{this.initiatePayment();const r=f.getAllRequestedCaipNetworks().find(d=>d.caipNetworkId===s.network);if(!r)throw new Error("Target network not found");const a=f.state.activeCaipNetwork;switch(se.isLowerCaseMatch(a?.caipNetworkId,r.caipNetworkId)||await f.switchActiveNetwork(r),t){case U.CHAIN.EVM:s.asset==="native"&&(l.currentPayment.result=await go(s,t,{recipient:n,amount:i,fromAddress:e})),s.asset.startsWith("0x")&&(l.currentPayment.result=await yo(s,{recipient:n,amount:i,fromAddress:e})),l.currentPayment.status="SUCCESS";break;case U.CHAIN.SOLANA:l.currentPayment.result=await bo(t,{recipient:n,amount:i,fromAddress:e,tokenMint:s.asset==="native"?void 0:s.asset}),l.currentPayment.status="SUCCESS";break;default:throw new b(g.INVALID_CHAIN_NAMESPACE)}}catch(o){throw o instanceof b?l.error=o.message:l.error=xe.GENERIC_PAYMENT_ERROR,l.currentPayment.status="FAILED",C.showError(l.error),o}finally{l.isPaymentInProgress=!1}},async onSendTransaction(t){try{const{namespace:e,transactionStep:n}=t;p.initiatePayment();const s=f.getAllRequestedCaipNetworks().find(r=>r.caipNetworkId===l.paymentAsset?.network);if(!s)throw new Error("Target network not found");const o=f.state.activeCaipNetwork;if(se.isLowerCaseMatch(o?.caipNetworkId,s.caipNetworkId)||await f.switchActiveNetwork(s),e===U.CHAIN.EVM){const{from:r,to:a,data:d,value:x}=n.transaction;await G.sendTransaction({address:r,to:a,data:d,value:BigInt(x),chainNamespace:e})}else if(e===U.CHAIN.SOLANA){const{instructions:r}=n.transaction;await G.writeSolanaTransaction({instructions:r})}}catch(e){throw e instanceof b?l.error=e.message:l.error=xe.GENERIC_PAYMENT_ERROR,C.showError(l.error),e}finally{l.isPaymentInProgress=!1}},getExchangeById(t){return l.exchanges.find(e=>e.id===t)},validatePayConfig(t){const{paymentAsset:e,recipient:n,amount:i}=t;if(!e)throw new b(g.INVALID_PAYMENT_CONFIG);if(!n)throw new b(g.INVALID_RECIPIENT);if(!e.asset)throw new b(g.INVALID_ASSET);if(i==null||i<=0)throw new b(g.INVALID_AMOUNT)},async handlePayWithExchange(t){try{l.currentPayment={type:"exchange",exchangeId:t};const{network:e,asset:n}=l.paymentAsset,i={network:e,asset:n,amount:l.amount,recipient:l.recipient},s=await this.getPayUrl(t,i);if(!s)throw new b(g.UNABLE_TO_INITIATE_PAYMENT);return l.currentPayment.sessionId=s.sessionId,l.currentPayment.status="IN_PROGRESS",l.currentPayment.exchangeId=t,this.initiatePayment(),{url:s.url,openInNewTab:l.openInNewTab}}catch(e){return e instanceof b?l.error=e.message:l.error=xe.GENERIC_PAYMENT_ERROR,l.isPaymentInProgress=!1,C.showError(l.error),null}},async getBuyStatus(t,e){try{const n=await Ao({sessionId:e,exchangeId:t});return(n.status==="SUCCESS"||n.status==="FAILED")&&K.sendEvent({type:"track",event:n.status==="SUCCESS"?"PAY_SUCCESS":"PAY_ERROR",properties:{message:n.status==="FAILED"?ee.parseError(l.error):void 0,source:"pay",paymentId:l.paymentId||Ot,configuration:{network:l.paymentAsset.network,asset:l.paymentAsset.asset,recipient:l.recipient,amount:l.amount},currentPayment:{type:"exchange",exchangeId:l.currentPayment?.exchangeId,sessionId:l.currentPayment?.sessionId,result:n.txHash}}}),n}catch{throw new b(g.UNABLE_TO_GET_BUY_STATUS)}},async fetchTokensFromEOA({caipAddress:t,caipNetwork:e,namespace:n}){if(!t)return[];const{address:i}=D.parseCaipAddress(t);let s=e;return n===U.CHAIN.EVM&&(s=void 0),await Bn.getMyTokensWithBalance({address:i,caipNetwork:s})},async fetchTokensFromExchange(){if(!l.selectedExchange)return[];const t=await Eo(l.selectedExchange.id),e=Object.values(t.assets).flat();return await Promise.all(e.map(async i=>{const s=No(i),{chainNamespace:o}=D.parseCaipNetworkId(s.chainId);let r=s.address;if(ee.isCaipAddress(r)){const{address:d}=D.parseCaipAddress(r);r=d}const a=await Q.getImageByToken(r??"",o).catch(()=>{});return s.iconUrl=a??"",s}))},async fetchTokens({caipAddress:t,caipNetwork:e,namespace:n}){try{l.isFetchingTokenBalances=!0;const o=await(!!l.selectedExchange?this.fetchTokensFromExchange():this.fetchTokensFromEOA({caipAddress:t,caipNetwork:e,namespace:n}));l.tokenBalances={...l.tokenBalances,[n]:o}}catch(i){const s=i instanceof Error?i.message:"Unable to get token balances";C.showError(s)}finally{l.isFetchingTokenBalances=!1}},async fetchQuote({amount:t,address:e,sourceToken:n,toToken:i,recipient:s}){try{p.resetQuoteState(),l.isFetchingQuote=!0;const o=await So({amount:t,address:l.selectedExchange?void 0:e,sourceToken:n,toToken:i,recipient:s});if(l.selectedExchange){const r=Lt(o);if(r){const a=`${n.network}:${r.deposit.receiver}`,d=k.formatNumber(r.deposit.amount,{decimals:n.metadata.decimals??0,round:8});await p.generateExchangeUrlForQuote({exchangeId:l.selectedExchange.id,paymentAsset:n,amount:d.toString(),recipient:a})}}l.quote=o}catch(o){let r=xe.UNABLE_TO_GET_QUOTE;if(o instanceof Error&&o.cause&&o.cause instanceof Response)try{const a=await o.cause.json();a.error&&typeof a.error=="string"&&(r=a.error)}catch{}throw l.quoteError=r,C.showError(r),new b(g.UNABLE_TO_GET_QUOTE)}finally{l.isFetchingQuote=!1}},async fetchQuoteStatus({requestId:t}){try{if(t===Bt){const n=l.selectedExchange,i=l.exchangeSessionId;if(n&&i){switch((await this.getBuyStatus(n.id,i)).status){case"IN_PROGRESS":l.quoteStatus="waiting";break;case"SUCCESS":l.quoteStatus="success",l.isPaymentInProgress=!1;break;case"FAILED":l.quoteStatus="failure",l.isPaymentInProgress=!1;break;case"UNKNOWN":l.quoteStatus="waiting";break;default:l.quoteStatus="waiting";break}return}l.quoteStatus="success";return}const{status:e}=await To({requestId:t});l.quoteStatus=e}catch{throw l.quoteStatus="failure",new b(g.UNABLE_TO_GET_QUOTE_STATUS)}},initiatePayment(){l.isPaymentInProgress=!0,l.paymentId=crypto.randomUUID()},initializeAnalytics(){l.analyticsSet||(l.analyticsSet=!0,this.subscribeKey("isPaymentInProgress",t=>{if(l.currentPayment?.status&&l.currentPayment.status!=="UNKNOWN"){const e={IN_PROGRESS:"PAY_INITIATED",SUCCESS:"PAY_SUCCESS",FAILED:"PAY_ERROR"}[l.currentPayment.status];K.sendEvent({type:"track",event:e,properties:{message:l.currentPayment.status==="FAILED"?ee.parseError(l.error):void 0,source:"pay",paymentId:l.paymentId||Ot,configuration:{network:l.paymentAsset.network,asset:l.paymentAsset.asset,recipient:l.recipient,amount:l.amount},currentPayment:{type:l.currentPayment.type,exchangeId:l.currentPayment.exchangeId,sessionId:l.currentPayment.sessionId,result:l.currentPayment.result}}})}}))},async prepareTokenLogo(){if(!l.paymentAsset.metadata.logoURI)try{const{chainNamespace:t}=D.parseCaipNetworkId(l.paymentAsset.network),e=await Q.getImageByToken(l.paymentAsset.asset,t);l.paymentAsset.metadata.logoURI=e}catch{}}},Wo=E`
  wui-separator {
    margin: var(--apkt-spacing-3) calc(var(--apkt-spacing-3) * -1) var(--apkt-spacing-2)
      calc(var(--apkt-spacing-3) * -1);
    width: calc(100% + var(--apkt-spacing-3) * 2);
  }

  .token-display {
    padding: var(--apkt-spacing-3) var(--apkt-spacing-3);
    border-radius: var(--apkt-borderRadius-5);
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
    margin-top: var(--apkt-spacing-3);
    margin-bottom: var(--apkt-spacing-3);
  }

  .token-display wui-text {
    text-transform: none;
  }

  wui-loading-spinner {
    padding: var(--apkt-spacing-2);
  }

  .left-image-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .token-image {
    border-radius: ${({borderRadius:t})=>t.round};
    width: 40px;
    height: 40px;
  }

  .chain-image {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: -3px;
    right: -5px;
    border-radius: ${({borderRadius:t})=>t.round};
    border: 2px solid ${({tokens:t})=>t.theme.backgroundPrimary};
  }

  .payment-methods-container {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:t})=>t[8]};
    border-top-left-radius: ${({borderRadius:t})=>t[8]};
  }
`;var Ee=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let ue=class extends te{constructor(){super(),this.unsubscribe=[],this.amount=p.state.amount,this.namespace=void 0,this.paymentAsset=p.state.paymentAsset,this.activeConnectorIds=q.state.activeConnectorIds,this.caipAddress=void 0,this.exchanges=p.state.exchanges,this.isLoading=p.state.isLoading,this.initializeNamespace(),this.unsubscribe.push(p.subscribeKey("amount",e=>this.amount=e)),this.unsubscribe.push(q.subscribeKey("activeConnectorIds",e=>this.activeConnectorIds=e)),this.unsubscribe.push(p.subscribeKey("exchanges",e=>this.exchanges=e)),this.unsubscribe.push(p.subscribeKey("isLoading",e=>this.isLoading=e)),p.fetchExchanges(),p.setSelectedExchange(void 0)}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return h`
      <wui-flex flexDirection="column">
        ${this.paymentDetailsTemplate()} ${this.paymentMethodsTemplate()}
      </wui-flex>
    `}paymentMethodsTemplate(){return h`
      <wui-flex flexDirection="column" padding="3" gap="2" class="payment-methods-container">
        ${this.payWithWalletTemplate()} ${this.templateSeparator()}
        ${this.templateExchangeOptions()}
      </wui-flex>
    `}initializeNamespace(){const e=f.state.activeChain;this.namespace=e,this.caipAddress=f.getAccountData(e)?.caipAddress,this.unsubscribe.push(f.subscribeChainProp("accountState",n=>{this.caipAddress=n?.caipAddress},e))}paymentDetailsTemplate(){const n=f.getAllRequestedCaipNetworks().find(i=>i.caipNetworkId===this.paymentAsset.network);return h`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        .padding=${["6","8","6","8"]}
        gap="2"
      >
        <wui-flex alignItems="center" gap="1">
          <wui-text variant="h1-regular" color="primary">
            ${vt(this.amount||"0")}
          </wui-text>

          <wui-flex flexDirection="column">
            <wui-text variant="h6-regular" color="secondary">
              ${this.paymentAsset.metadata.symbol||"Unknown"}
            </wui-text>
            <wui-text variant="md-medium" color="secondary"
              >on ${n?.name||"Unknown"}</wui-text
            >
          </wui-flex>
        </wui-flex>

        <wui-flex class="left-image-container">
          <wui-image
            src=${O(this.paymentAsset.metadata.logoURI)}
            class="token-image"
          ></wui-image>
          <wui-image
            src=${O(Q.getNetworkImage(n))}
            class="chain-image"
          ></wui-image>
        </wui-flex>
      </wui-flex>
    `}payWithWalletTemplate(){return Io(this.paymentAsset.network)?this.caipAddress?this.connectedWalletTemplate():this.disconnectedWalletTemplate():h``}connectedWalletTemplate(){const{name:e,image:n}=this.getWalletProperties({namespace:this.namespace});return h`
      <wui-flex flexDirection="column" gap="3">
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${this.onWalletPayment}
          .boxed=${!1}
          ?chevron=${!0}
          ?fullSize=${!1}
          ?rounded=${!0}
          data-testid="wallet-payment-option"
          imageSrc=${O(n)}
          imageSize="3xl"
        >
          <wui-text variant="lg-regular" color="primary">Pay with ${e}</wui-text>
        </wui-list-item>

        <wui-list-item
          type="secondary"
          icon="power"
          iconColor="error"
          @click=${this.onDisconnect}
          data-testid="disconnect-button"
          ?chevron=${!1}
          boxColor="foregroundSecondary"
        >
          <wui-text variant="lg-regular" color="secondary">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>
    `}disconnectedWalletTemplate(){return h`<wui-list-item
      type="secondary"
      boxColor="foregroundSecondary"
      variant="icon"
      iconColor="default"
      iconVariant="overlay"
      icon="wallet"
      @click=${this.onWalletPayment}
      ?chevron=${!0}
      data-testid="wallet-payment-option"
    >
      <wui-text variant="lg-regular" color="primary">Pay with wallet</wui-text>
    </wui-list-item>`}templateExchangeOptions(){if(this.isLoading)return h`<wui-flex justifyContent="center" alignItems="center">
        <wui-loading-spinner size="md"></wui-loading-spinner>
      </wui-flex>`;const e=this.exchanges.filter(n=>Ro(this.paymentAsset)?n.id===En:n.id!==En);return e.length===0?h`<wui-flex justifyContent="center" alignItems="center">
        <wui-text variant="md-medium" color="primary">No exchanges available</wui-text>
      </wui-flex>`:e.map(n=>h`
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${()=>this.onExchangePayment(n)}
          data-testid="exchange-option-${n.id}"
          ?chevron=${!0}
          imageSrc=${O(n.imageUrl)}
        >
          <wui-text flexGrow="1" variant="lg-regular" color="primary">
            Pay with ${n.name}
          </wui-text>
        </wui-list-item>
      `)}templateSeparator(){return h`<wui-separator text="or" bgColor="secondary"></wui-separator>`}async onWalletPayment(){if(!this.namespace)throw new Error("Namespace not found");this.caipAddress?m.push("PayQuote"):(await q.connect(),await H.open({view:"PayQuote"}))}onExchangePayment(e){p.setSelectedExchange(e),m.push("PayQuote")}async onDisconnect(){try{await G.disconnect(),await H.open({view:"Pay"})}catch{console.error("Failed to disconnect"),C.showError("Failed to disconnect")}}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};const n=this.activeConnectorIds[e];if(!n)return{name:void 0,image:void 0};const i=q.getConnector({id:n,namespace:e});if(!i)return{name:void 0,image:void 0};const s=Q.getConnectorImage(i);return{name:i.name,image:s}}};ue.styles=Wo;Ee([v()],ue.prototype,"amount",void 0);Ee([v()],ue.prototype,"namespace",void 0);Ee([v()],ue.prototype,"paymentAsset",void 0);Ee([v()],ue.prototype,"activeConnectorIds",void 0);Ee([v()],ue.prototype,"caipAddress",void 0);Ee([v()],ue.prototype,"exchanges",void 0);Ee([v()],ue.prototype,"isLoading",void 0);ue=Ee([A("w3m-pay-view")],ue);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Do={ATTRIBUTE:1},Lo=t=>(...e)=>({_$litDirective$:t,values:e});class Bo{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,n,i){this._$Ct=e,this._$AM=n,this._$Ci=i}_$AS(e,n){return this.update(e,n)}update(e,n){return this.render(...n)}}/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ti=Lo(class extends Bo{constructor(t){if(super(t),t.type!==Do.ATTRIBUTE||t.name!=="class"||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(this.st===void 0){this.st=new Set,t.strings!==void 0&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(i=>i!=="")));for(const i in e)e[i]&&!this.nt?.has(i)&&this.st.add(i);return this.render(e)}const n=t.element.classList;for(const i of this.st)i in e||(n.remove(i),this.st.delete(i));for(const i in e){const s=!!e[i];s===this.st.has(i)||this.nt?.has(i)||(s?(n.add(i),this.st.add(i)):(n.remove(i),this.st.delete(i)))}return Re}}),zo=E`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-container {
    position: relative;
    width: var(--pulse-size);
    height: var(--pulse-size);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-rings {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .pulse-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid var(--pulse-color);
    opacity: 0;
    animation: pulse var(--pulse-duration, 2s) ease-out infinite;
  }

  .pulse-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.5);
      opacity: var(--pulse-opacity, 0.3);
    }
    50% {
      opacity: calc(var(--pulse-opacity, 0.3) * 0.5);
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
`;var Fe=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};const Fo=3,Mo=2,jo=.3,Ho="200px",qo={"accent-primary":Ye.tokens.core.backgroundAccentPrimary};let Se=class extends he{constructor(){super(...arguments),this.rings=Fo,this.duration=Mo,this.opacity=jo,this.size=Ho,this.variant="accent-primary"}render(){const e=qo[this.variant];this.style.cssText=`
      --pulse-size: ${this.size};
      --pulse-duration: ${this.duration}s;
      --pulse-color: ${e};
      --pulse-opacity: ${this.opacity};
    `;const n=Array.from({length:this.rings},(i,s)=>this.renderRing(s,this.rings));return P`
      <div class="pulse-container">
        <div class="pulse-rings">${n}</div>
        <div class="pulse-content">
          <slot></slot>
        </div>
      </div>
    `}renderRing(e,n){const s=`animation-delay: ${e/n*this.duration}s;`;return P`<div class="pulse-ring" style=${s}></div>`}};Se.styles=[pe,zo];Fe([y({type:Number})],Se.prototype,"rings",void 0);Fe([y({type:Number})],Se.prototype,"duration",void 0);Fe([y({type:Number})],Se.prototype,"opacity",void 0);Fe([y()],Se.prototype,"size",void 0);Fe([y()],Se.prototype,"variant",void 0);Se=Fe([A("wui-pulse")],Se);const Nn=[{id:"received",title:"Receiving funds",icon:"dollar"},{id:"processing",title:"Swapping asset",icon:"recycleHorizontal"},{id:"sending",title:"Sending asset to the recipient address",icon:"send"}],Rn=["success","submitted","failure","timeout","refund"],Vo=E`
  :host {
    display: block;
    height: 100%;
    width: 100%;
  }

  wui-image {
    border-radius: ${({borderRadius:t})=>t.round};
  }

  .token-badge-container {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: ${({borderRadius:t})=>t[4]};
    z-index: 3;
    min-width: 105px;
  }

  .token-badge-container.loading {
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    border: 3px solid ${({tokens:t})=>t.theme.backgroundPrimary};
  }

  .token-badge-container.success {
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    border: 3px solid ${({tokens:t})=>t.theme.backgroundPrimary};
  }

  .token-image-container {
    position: relative;
  }

  .token-image {
    border-radius: ${({borderRadius:t})=>t.round};
    width: 64px;
    height: 64px;
  }

  .token-image.success {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  .token-image.error {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  .token-image.loading {
    background: ${({colors:t})=>t.accent010};
  }

  .token-image wui-icon {
    width: 32px;
    height: 32px;
  }

  .token-badge {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border: 1px solid ${({tokens:t})=>t.theme.foregroundSecondary};
    border-radius: ${({borderRadius:t})=>t[4]};
  }

  .token-badge wui-text {
    white-space: nowrap;
  }

  .payment-lifecycle-container {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:t})=>t[6]};
    border-top-left-radius: ${({borderRadius:t})=>t[6]};
  }

  .payment-step-badge {
    padding: ${({spacing:t})=>t[1]} ${({spacing:t})=>t[2]};
    border-radius: ${({borderRadius:t})=>t[1]};
  }

  .payment-step-badge.loading {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  .payment-step-badge.error {
    background-color: ${({tokens:t})=>t.core.backgroundError};
  }

  .payment-step-badge.success {
    background-color: ${({tokens:t})=>t.core.backgroundSuccess};
  }

  .step-icon-container {
    position: relative;
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:t})=>t.round};
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  .step-icon-box {
    position: absolute;
    right: -4px;
    bottom: -1px;
    padding: 2px;
    border-radius: ${({borderRadius:t})=>t.round};
    border: 2px solid ${({tokens:t})=>t.theme.backgroundPrimary};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  .step-icon-box.success {
    background-color: ${({tokens:t})=>t.core.backgroundSuccess};
  }
`;var me=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};const Go={received:["pending","success","submitted"],processing:["success","submitted"],sending:["success","submitted"]},Yo=3e3;let ne=class extends te{constructor(){super(),this.unsubscribe=[],this.pollingInterval=null,this.paymentAsset=p.state.paymentAsset,this.quoteStatus=p.state.quoteStatus,this.quote=p.state.quote,this.amount=p.state.amount,this.namespace=void 0,this.caipAddress=void 0,this.profileName=null,this.activeConnectorIds=q.state.activeConnectorIds,this.selectedExchange=p.state.selectedExchange,this.initializeNamespace(),this.unsubscribe.push(p.subscribeKey("quoteStatus",e=>this.quoteStatus=e),p.subscribeKey("quote",e=>this.quote=e),q.subscribeKey("activeConnectorIds",e=>this.activeConnectorIds=e),p.subscribeKey("selectedExchange",e=>this.selectedExchange=e))}connectedCallback(){super.connectedCallback(),this.startPolling()}disconnectedCallback(){super.disconnectedCallback(),this.stopPolling(),this.unsubscribe.forEach(e=>e())}render(){return h`
      <wui-flex flexDirection="column" .padding=${["3","0","0","0"]} gap="2">
        ${this.tokenTemplate()} ${this.paymentTemplate()} ${this.paymentLifecycleTemplate()}
      </wui-flex>
    `}tokenTemplate(){const e=vt(this.amount||"0"),n=this.paymentAsset.metadata.symbol??"Unknown",s=f.getAllRequestedCaipNetworks().find(a=>a.caipNetworkId===this.paymentAsset.network),o=this.quoteStatus==="failure"||this.quoteStatus==="timeout"||this.quoteStatus==="refund";return this.quoteStatus==="success"||this.quoteStatus==="submitted"?h`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image success">
          <wui-icon name="checkmark" color="success" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`:o?h`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image error">
          <wui-icon name="close" color="error" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`:h`
      <wui-flex alignItems="center" justifyContent="center">
        <wui-flex class="token-image-container">
          <wui-pulse size="125px" rings="3" duration="4" opacity="0.5" variant="accent-primary">
            <wui-flex justifyContent="center" alignItems="center" class="token-image loading">
              <wui-icon name="paperPlaneTitle" color="accent-primary" size="inherit"></wui-icon>
            </wui-flex>
          </wui-pulse>

          <wui-flex
            justifyContent="center"
            alignItems="center"
            class="token-badge-container loading"
          >
            <wui-flex
              alignItems="center"
              justifyContent="center"
              gap="01"
              padding="1"
              class="token-badge"
            >
              <wui-image
                src=${O(Q.getNetworkImage(s))}
                class="chain-image"
                size="mdl"
              ></wui-image>

              <wui-text variant="lg-regular" color="primary">${e} ${n}</wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}paymentTemplate(){return h`
      <wui-flex flexDirection="column" gap="2" .padding=${["0","6","0","6"]}>
        ${this.renderPayment()}
        <wui-separator></wui-separator>
        ${this.renderWallet()}
      </wui-flex>
    `}paymentLifecycleTemplate(){const e=this.getStepsWithStatus();return h`
      <wui-flex flexDirection="column" padding="4" gap="2" class="payment-lifecycle-container">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">PAYMENT CYCLE</wui-text>

          ${this.renderPaymentCycleBadge()}
        </wui-flex>

        <wui-flex flexDirection="column" gap="5" .padding=${["2","0","2","0"]}>
          ${e.map(n=>this.renderStep(n))}
        </wui-flex>
      </wui-flex>
    `}renderPaymentCycleBadge(){const e=this.quoteStatus==="failure"||this.quoteStatus==="timeout"||this.quoteStatus==="refund",n=this.quoteStatus==="success"||this.quoteStatus==="submitted";if(e)return h`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge error"
          gap="1"
        >
          <wui-icon name="close" color="error" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="error">Failed</wui-text>
        </wui-flex>
      `;if(n)return h`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge success"
          gap="1"
        >
          <wui-icon name="checkmark" color="success" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="success">Completed</wui-text>
        </wui-flex>
      `;const i=this.quote?.timeInSeconds??0;return h`
      <wui-flex alignItems="center" justifyContent="space-between" gap="3">
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge loading"
          gap="1"
        >
          <wui-icon name="clock" color="default" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="primary">Est. ${i} sec</wui-text>
        </wui-flex>

        <wui-icon name="chevronBottom" color="default" size="xxs"></wui-icon>
      </wui-flex>
    `}renderPayment(){const n=f.getAllRequestedCaipNetworks().find(r=>{const a=this.quote?.origin.currency.network;if(!a)return!1;const{chainId:d}=D.parseCaipNetworkId(a);return se.isLowerCaseMatch(r.id.toString(),d.toString())}),i=k.formatNumber(this.quote?.origin.amount||"0",{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString(),s=vt(i),o=this.quote?.origin.currency.metadata.symbol??"Unknown";return h`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${["3","0","3","0"]}
      >
        <wui-text variant="lg-regular" color="secondary">Payment Method</wui-text>

        <wui-flex flexDirection="column" alignItems="flex-end" gap="1">
          <wui-flex alignItems="center" gap="01">
            <wui-text variant="lg-regular" color="primary">${s}</wui-text>
            <wui-text variant="lg-regular" color="secondary">${o}</wui-text>
          </wui-flex>

          <wui-flex alignItems="center" gap="1">
            <wui-text variant="md-regular" color="secondary">on</wui-text>
            <wui-image
              src=${O(Q.getNetworkImage(n))}
              size="xs"
            ></wui-image>
            <wui-text variant="md-regular" color="secondary">${n?.name}</wui-text>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}renderWallet(){return h`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${["3","0","3","0"]}
      >
        <wui-text variant="lg-regular" color="secondary"
          >${this.selectedExchange?"Exchange":"Wallet"}</wui-text
        >

        ${this.renderWalletText()}
      </wui-flex>
    `}renderWalletText(){const{image:e}=this.getWalletProperties({namespace:this.namespace}),{address:n}=this.caipAddress?D.parseCaipAddress(this.caipAddress):{},i=this.selectedExchange?.name;return this.selectedExchange?h`
        <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
          <wui-text variant="lg-regular" color="primary">${i}</wui-text>
          <wui-image src=${O(this.selectedExchange.imageUrl)} size="mdl"></wui-image>
        </wui-flex>
      `:h`
      <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
        <wui-text variant="lg-regular" color="primary">
          ${St.getTruncateString({string:this.profileName||n||i||"",charsStart:this.profileName?16:4,charsEnd:this.profileName?0:6,truncate:this.profileName?"end":"middle"})}
        </wui-text>

        <wui-image src=${O(e)} size="mdl"></wui-image>
      </wui-flex>
    `}getStepsWithStatus(){return this.quoteStatus==="failure"||this.quoteStatus==="timeout"||this.quoteStatus==="refund"?Nn.map(n=>({...n,status:"failed"})):Nn.map(n=>{const s=(Go[n.id]??[]).includes(this.quoteStatus)?"completed":"pending";return{...n,status:s}})}renderStep({title:e,icon:n,status:i}){return h`
      <wui-flex alignItems="center" gap="3">
        <wui-flex justifyContent="center" alignItems="center" class="step-icon-container">
          <wui-icon name=${n} color="default" size="mdl"></wui-icon>

          <wui-flex alignItems="center" justifyContent="center" class=${ti({"step-icon-box":!0,success:i==="completed"})}>
            ${this.renderStatusIndicator(i)}
          </wui-flex>
        </wui-flex>

        <wui-text variant="md-regular" color="primary">${e}</wui-text>
      </wui-flex>
    `}renderStatusIndicator(e){return e==="completed"?h`<wui-icon size="sm" color="success" name="checkmark"></wui-icon>`:e==="failed"?h`<wui-icon size="sm" color="error" name="close"></wui-icon>`:e==="pending"?h`<wui-loading-spinner color="accent-primary" size="sm"></wui-loading-spinner>`:null}startPolling(){this.pollingInterval||(this.fetchQuoteStatus(),this.pollingInterval=setInterval(()=>{this.fetchQuoteStatus()},Yo))}stopPolling(){this.pollingInterval&&(clearInterval(this.pollingInterval),this.pollingInterval=null)}async fetchQuoteStatus(){const e=p.state.requestId;if(!e||Rn.includes(this.quoteStatus))this.stopPolling();else try{await p.fetchQuoteStatus({requestId:e}),Rn.includes(this.quoteStatus)&&this.stopPolling()}catch{this.stopPolling()}}initializeNamespace(){const e=f.state.activeChain;this.namespace=e,this.caipAddress=f.getAccountData(e)?.caipAddress,this.profileName=f.getAccountData(e)?.profileName??null,this.unsubscribe.push(f.subscribeChainProp("accountState",n=>{this.caipAddress=n?.caipAddress,this.profileName=n?.profileName??null},e))}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};const n=this.activeConnectorIds[e];if(!n)return{name:void 0,image:void 0};const i=q.getConnector({id:n,namespace:e});if(!i)return{name:void 0,image:void 0};const s=Q.getConnectorImage(i);return{name:i.name,image:s}}};ne.styles=Vo;me([v()],ne.prototype,"paymentAsset",void 0);me([v()],ne.prototype,"quoteStatus",void 0);me([v()],ne.prototype,"quote",void 0);me([v()],ne.prototype,"amount",void 0);me([v()],ne.prototype,"namespace",void 0);me([v()],ne.prototype,"caipAddress",void 0);me([v()],ne.prototype,"profileName",void 0);me([v()],ne.prototype,"activeConnectorIds",void 0);me([v()],ne.prototype,"selectedExchange",void 0);ne=me([A("w3m-pay-loading-view")],ne);const Ko=E`
  button {
    display: flex;
    align-items: center;
    height: 40px;
    padding: ${({spacing:t})=>t[2]};
    border-radius: ${({borderRadius:t})=>t[4]};
    column-gap: ${({spacing:t})=>t[1]};
    background-color: transparent;
    transition: background-color ${({durations:t})=>t.lg}
      ${({easings:t})=>t["ease-out-power-2"]};
    will-change: background-color;
  }

  wui-image,
  .icon-box {
    width: ${({spacing:t})=>t[6]};
    height: ${({spacing:t})=>t[6]};
    border-radius: ${({borderRadius:t})=>t[4]};
  }

  wui-text {
    flex: 1;
  }

  .icon-box {
    position: relative;
  }

  .icon-box[data-active='true'] {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  .circle {
    position: absolute;
    left: 16px;
    top: 15px;
    width: 8px;
    height: 8px;
    background-color: ${({tokens:t})=>t.core.textSuccess};
    box-shadow: 0 0 0 2px ${({tokens:t})=>t.theme.foregroundPrimary};
    border-radius: 50%;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    }
  }
`;var re=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let X=class extends he{constructor(){super(...arguments),this.address="",this.profileName="",this.alt="",this.imageSrc="",this.icon=void 0,this.iconSize="md",this.enableGreenCircle=!0,this.loading=!1,this.charsStart=4,this.charsEnd=6}render(){return P`
      <button>
        ${this.leftImageTemplate()} ${this.textTemplate()} ${this.rightImageTemplate()}
      </button>
    `}leftImageTemplate(){const e=this.icon?P`<wui-icon
          size=${Ht(this.iconSize)}
          color="default"
          name=${this.icon}
          class="icon"
        ></wui-icon>`:P`<wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>`;return P`
      <wui-flex
        alignItems="center"
        justifyContent="center"
        class="icon-box"
        data-active=${!!this.icon}
      >
        ${e}
        ${this.enableGreenCircle?P`<wui-flex class="circle"></wui-flex>`:null}
      </wui-flex>
    `}textTemplate(){return P`
      <wui-text variant="lg-regular" color="primary">
        ${St.getTruncateString({string:this.profileName||this.address,charsStart:this.profileName?16:this.charsStart,charsEnd:this.profileName?0:this.charsEnd,truncate:this.profileName?"end":"middle"})}
      </wui-text>
    `}rightImageTemplate(){return P`<wui-icon name="chevronBottom" size="sm" color="default"></wui-icon>`}};X.styles=[pe,Tt,Ko];re([y()],X.prototype,"address",void 0);re([y()],X.prototype,"profileName",void 0);re([y()],X.prototype,"alt",void 0);re([y()],X.prototype,"imageSrc",void 0);re([y()],X.prototype,"icon",void 0);re([y()],X.prototype,"iconSize",void 0);re([y({type:Boolean})],X.prototype,"enableGreenCircle",void 0);re([y({type:Boolean})],X.prototype,"loading",void 0);re([y({type:Number})],X.prototype,"charsStart",void 0);re([y({type:Number})],X.prototype,"charsEnd",void 0);X=re([A("wui-wallet-switch")],X);const Qo=Ii`
  :host {
    display: block;
  }
`;var Xo=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let zt=class extends te{render(){return h`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-shimmer width="60px" height="16px" borderRadius="4xs" variant="light"></wui-shimmer>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Network Fee</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-shimmer
              width="75px"
              height="16px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>

            <wui-flex alignItems="center" gap="01">
              <wui-shimmer width="14px" height="14px" rounded variant="light"></wui-shimmer>
              <wui-shimmer
                width="49px"
                height="14px"
                borderRadius="4xs"
                variant="light"
              ></wui-shimmer>
            </wui-flex>
          </wui-flex>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Service Fee</wui-text>
          <wui-shimmer width="75px" height="16px" borderRadius="4xs" variant="light"></wui-shimmer>
        </wui-flex>
      </wui-flex>
    `}};zt.styles=[Qo];zt=Xo([A("w3m-pay-fees-skeleton")],zt);const Zo=E`
  :host {
    display: block;
  }

  wui-image {
    border-radius: ${({borderRadius:t})=>t.round};
  }
`;var ni=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let xt=class extends te{constructor(){super(),this.unsubscribe=[],this.quote=p.state.quote,this.unsubscribe.push(p.subscribeKey("quote",e=>this.quote=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const e=k.formatNumber(this.quote?.origin.amount||"0",{decimals:this.quote?.origin.currency.metadata.decimals??0,round:6}).toString();return h`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-text variant="md-regular" color="primary">
            ${e} ${this.quote?.origin.currency.metadata.symbol||"Unknown"}
          </wui-text>
        </wui-flex>

        ${this.quote&&this.quote.fees.length>0?this.quote.fees.map(n=>this.renderFee(n)):null}
      </wui-flex>
    `}renderFee(e){const n=e.id==="network",i=k.formatNumber(e.amount||"0",{decimals:e.currency.metadata.decimals??0,round:6}).toString();if(n){const o=f.getAllRequestedCaipNetworks().find(r=>se.isLowerCaseMatch(r.caipNetworkId,e.currency.network));return h`
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">${e.label}</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-text variant="md-regular" color="primary">
              ${i} ${e.currency.metadata.symbol||"Unknown"}
            </wui-text>

            <wui-flex alignItems="center" gap="01">
              <wui-image
                src=${O(Q.getNetworkImage(o))}
                size="xs"
              ></wui-image>
              <wui-text variant="sm-regular" color="secondary">
                ${o?.name||"Unknown"}
              </wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      `}return h`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-text variant="md-regular" color="secondary">${e.label}</wui-text>
        <wui-text variant="md-regular" color="primary">
          ${i} ${e.currency.metadata.symbol||"Unknown"}
        </wui-text>
      </wui-flex>
    `}};xt.styles=[Zo];ni([v()],xt.prototype,"quote",void 0);xt=ni([A("w3m-pay-fees")],xt);const Jo=E`
  :host {
    display: block;
    width: 100%;
  }

  .disabled-container {
    padding: ${({spacing:t})=>t[2]};
    min-height: 168px;
  }

  wui-icon {
    width: ${({spacing:t})=>t[8]};
    height: ${({spacing:t})=>t[8]};
  }

  wui-flex > wui-text {
    max-width: 273px;
  }
`;var ii=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let kt=class extends te{constructor(){super(),this.unsubscribe=[],this.selectedExchange=p.state.selectedExchange,this.unsubscribe.push(p.subscribeKey("selectedExchange",e=>this.selectedExchange=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const e=!!this.selectedExchange;return h`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
        class="disabled-container"
      >
        <wui-icon name="coins" color="default" size="inherit"></wui-icon>

        <wui-text variant="md-regular" color="primary" align="center">
          You don't have enough funds to complete this transaction
        </wui-text>

        ${e?null:h`<wui-button
              size="md"
              variant="neutral-secondary"
              @click=${this.dispatchConnectOtherWalletEvent.bind(this)}
              >Connect other wallet</wui-button
            >`}
      </wui-flex>
    `}dispatchConnectOtherWalletEvent(){this.dispatchEvent(new CustomEvent("connectOtherWallet",{detail:!0,bubbles:!0,composed:!0}))}};kt.styles=[Jo];ii([rt({type:Array})],kt.prototype,"selectedExchange",void 0);kt=ii([A("w3m-pay-options-empty")],kt);const es=E`
  :host {
    display: block;
    width: 100%;
  }

  .pay-options-container {
    max-height: 196px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  .pay-options-container::-webkit-scrollbar {
    display: none;
  }

  .pay-option-container {
    border-radius: ${({borderRadius:t})=>t[4]};
    padding: ${({spacing:t})=>t[3]};
    min-height: 60px;
  }

  .token-images-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .chain-image {
    position: absolute;
    bottom: -3px;
    right: -5px;
    border: 2px solid ${({tokens:t})=>t.theme.foregroundSecondary};
  }
`;var ts=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let Ft=class extends te{render(){return h`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.renderOptionEntry()} ${this.renderOptionEntry()} ${this.renderOptionEntry()}
      </wui-flex>
    `}renderOptionEntry(){return h`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-shimmer
              width="32px"
              height="32px"
              rounded
              variant="light"
              class="token-image"
            ></wui-shimmer>
            <wui-shimmer
              width="16px"
              height="16px"
              rounded
              variant="light"
              class="chain-image"
            ></wui-shimmer>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-shimmer
              width="74px"
              height="16px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>
            <wui-shimmer
              width="46px"
              height="14px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}};Ft.styles=[es];Ft=ts([A("w3m-pay-options-skeleton")],Ft);const ns=E`
  :host {
    display: block;
    width: 100%;
  }

  .pay-options-container {
    max-height: 196px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    mask-image: var(--options-mask-image);
    -webkit-mask-image: var(--options-mask-image);
  }

  .pay-options-container::-webkit-scrollbar {
    display: none;
  }

  .pay-option-container {
    cursor: pointer;
    border-radius: ${({borderRadius:t})=>t[4]};
    padding: ${({spacing:t})=>t[3]};
    transition: background-color ${({durations:t})=>t.lg}
      ${({easings:t})=>t["ease-out-power-1"]};
    will-change: background-color;
  }

  .token-images-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .token-image {
    border-radius: ${({borderRadius:t})=>t.round};
    width: 32px;
    height: 32px;
  }

  .chain-image {
    position: absolute;
    width: 16px;
    height: 16px;
    bottom: -3px;
    right: -5px;
    border-radius: ${({borderRadius:t})=>t.round};
    border: 2px solid ${({tokens:t})=>t.theme.backgroundPrimary};
  }

  @media (hover: hover) and (pointer: fine) {
    .pay-option-container:hover {
      background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    }
  }
`;var Pt=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};const is=300;let Le=class extends te{constructor(){super(),this.unsubscribe=[],this.options=[],this.selectedPaymentAsset=null}disconnectedCallback(){this.unsubscribe.forEach(n=>n()),this.resizeObserver?.disconnect(),this.shadowRoot?.querySelector(".pay-options-container")?.removeEventListener("scroll",this.handleOptionsListScroll.bind(this))}firstUpdated(){const e=this.shadowRoot?.querySelector(".pay-options-container");e&&(requestAnimationFrame(this.handleOptionsListScroll.bind(this)),e?.addEventListener("scroll",this.handleOptionsListScroll.bind(this)),this.resizeObserver=new ResizeObserver(()=>{this.handleOptionsListScroll()}),this.resizeObserver?.observe(e),this.handleOptionsListScroll())}render(){return h`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.options.map(e=>this.payOptionTemplate(e))}
      </wui-flex>
    `}payOptionTemplate(e){const{network:n,metadata:i,asset:s,amount:o="0"}=e,a=f.getAllRequestedCaipNetworks().find(Z=>Z.caipNetworkId===n),d=`${n}:${s}`,x=`${this.selectedPaymentAsset?.network}:${this.selectedPaymentAsset?.asset}`,T=d===x,$=k.bigNumber(o,{safe:!0}),V=$.gt(0);return h`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        @click=${()=>this.onSelect?.(e)}
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-image
              src=${O(i.logoURI)}
              class="token-image"
              size="3xl"
            ></wui-image>
            <wui-image
              src=${O(Q.getNetworkImage(a))}
              class="chain-image"
              size="md"
            ></wui-image>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="lg-regular" color="primary">${i.symbol}</wui-text>
            ${V?h`<wui-text variant="sm-regular" color="secondary">
                  ${$.round(6).toString()} ${i.symbol}
                </wui-text>`:null}
          </wui-flex>
        </wui-flex>

        ${T?h`<wui-icon name="checkmark" size="md" color="success"></wui-icon>`:null}
      </wui-flex>
    `}handleOptionsListScroll(){const e=this.shadowRoot?.querySelector(".pay-options-container");if(!e)return;e.scrollHeight>is?(e.style.setProperty("--options-mask-image",`linear-gradient(
          to bottom,
          rgba(0, 0, 0, calc(1 - var(--options-scroll--top-opacity))) 0px,
          rgba(200, 200, 200, calc(1 - var(--options-scroll--top-opacity))) 1px,
          black 50px,
          black calc(100% - 50px),
          rgba(155, 155, 155, calc(1 - var(--options-scroll--bottom-opacity))) calc(100% - 1px),
          rgba(0, 0, 0, calc(1 - var(--options-scroll--bottom-opacity))) 100%
        )`),e.style.setProperty("--options-scroll--top-opacity",pn.interpolate([0,50],[0,1],e.scrollTop).toString()),e.style.setProperty("--options-scroll--bottom-opacity",pn.interpolate([0,50],[0,1],e.scrollHeight-e.scrollTop-e.offsetHeight).toString())):(e.style.setProperty("--options-mask-image","none"),e.style.setProperty("--options-scroll--top-opacity","0"),e.style.setProperty("--options-scroll--bottom-opacity","0"))}};Le.styles=[ns];Pt([rt({type:Array})],Le.prototype,"options",void 0);Pt([rt()],Le.prototype,"selectedPaymentAsset",void 0);Pt([rt()],Le.prototype,"onSelect",void 0);Le=Pt([A("w3m-pay-options")],Le);const os=E`
  .payment-methods-container {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:t})=>t[5]};
    border-top-left-radius: ${({borderRadius:t})=>t[5]};
  }

  .pay-options-container {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    border-radius: ${({borderRadius:t})=>t[5]};
    padding: ${({spacing:t})=>t[1]};
  }

  w3m-tooltip-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: fit-content;
  }

  wui-image {
    border-radius: ${({borderRadius:t})=>t.round};
  }

  w3m-pay-options.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`;var z=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};const ut={eip155:"ethereum",solana:"solana",bip122:"bitcoin",ton:"ton"},ss={eip155:{icon:ut.eip155,label:"EVM"},solana:{icon:ut.solana,label:"Solana"},bip122:{icon:ut.bip122,label:"Bitcoin"},ton:{icon:ut.ton,label:"Ton"}};let W=class extends te{constructor(){super(),this.unsubscribe=[],this.profileName=null,this.paymentAsset=p.state.paymentAsset,this.namespace=void 0,this.caipAddress=void 0,this.amount=p.state.amount,this.recipient=p.state.recipient,this.activeConnectorIds=q.state.activeConnectorIds,this.selectedPaymentAsset=p.state.selectedPaymentAsset,this.selectedExchange=p.state.selectedExchange,this.isFetchingQuote=p.state.isFetchingQuote,this.quoteError=p.state.quoteError,this.quote=p.state.quote,this.isFetchingTokenBalances=p.state.isFetchingTokenBalances,this.tokenBalances=p.state.tokenBalances,this.isPaymentInProgress=p.state.isPaymentInProgress,this.exchangeUrlForQuote=p.state.exchangeUrlForQuote,this.completedTransactionsCount=0,this.unsubscribe.push(p.subscribeKey("paymentAsset",e=>this.paymentAsset=e)),this.unsubscribe.push(p.subscribeKey("tokenBalances",e=>this.onTokenBalancesChanged(e))),this.unsubscribe.push(p.subscribeKey("isFetchingTokenBalances",e=>this.isFetchingTokenBalances=e)),this.unsubscribe.push(q.subscribeKey("activeConnectorIds",e=>this.activeConnectorIds=e)),this.unsubscribe.push(p.subscribeKey("selectedPaymentAsset",e=>this.selectedPaymentAsset=e)),this.unsubscribe.push(p.subscribeKey("isFetchingQuote",e=>this.isFetchingQuote=e)),this.unsubscribe.push(p.subscribeKey("quoteError",e=>this.quoteError=e)),this.unsubscribe.push(p.subscribeKey("quote",e=>this.quote=e)),this.unsubscribe.push(p.subscribeKey("amount",e=>this.amount=e)),this.unsubscribe.push(p.subscribeKey("recipient",e=>this.recipient=e)),this.unsubscribe.push(p.subscribeKey("isPaymentInProgress",e=>this.isPaymentInProgress=e)),this.unsubscribe.push(p.subscribeKey("selectedExchange",e=>this.selectedExchange=e)),this.unsubscribe.push(p.subscribeKey("exchangeUrlForQuote",e=>this.exchangeUrlForQuote=e)),this.resetQuoteState(),this.initializeNamespace(),this.fetchTokens()}disconnectedCallback(){super.disconnectedCallback(),this.resetAssetsState(),this.unsubscribe.forEach(e=>e())}updated(e){super.updated(e),e.has("selectedPaymentAsset")&&this.fetchQuote()}render(){return h`
      <wui-flex flexDirection="column">
        ${this.profileTemplate()}

        <wui-flex
          flexDirection="column"
          gap="4"
          class="payment-methods-container"
          .padding=${["4","4","5","4"]}
        >
          ${this.paymentOptionsViewTemplate()} ${this.amountWithFeeTemplate()}

          <wui-flex
            alignItems="center"
            justifyContent="space-between"
            .padding=${["1","0","1","0"]}
          >
            <wui-separator></wui-separator>
          </wui-flex>

          ${this.paymentActionsTemplate()}
        </wui-flex>
      </wui-flex>
    `}profileTemplate(){if(this.selectedExchange){const r=k.formatNumber(this.quote?.origin.amount,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString();return h`
        <wui-flex
          .padding=${["4","3","4","3"]}
          alignItems="center"
          justifyContent="space-between"
          gap="2"
        >
          <wui-text variant="lg-regular" color="secondary">Paying with</wui-text>

          ${this.quote?h`<wui-text variant="lg-regular" color="primary">
                ${k.bigNumber(r,{safe:!0}).round(6).toString()}
                ${this.quote.origin.currency.metadata.symbol}
              </wui-text>`:h`<wui-shimmer width="80px" height="18px" variant="light"></wui-shimmer>`}
        </wui-flex>
      `}const e=ee.getPlainAddress(this.caipAddress)??"",{name:n,image:i}=this.getWalletProperties({namespace:this.namespace}),{icon:s,label:o}=ss[this.namespace]??{};return h`
      <wui-flex
        .padding=${["4","3","4","3"]}
        alignItems="center"
        justifyContent="space-between"
        gap="2"
      >
        <wui-wallet-switch
          profileName=${O(this.profileName)}
          address=${O(e)}
          imageSrc=${O(i)}
          alt=${O(n)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        <wui-wallet-switch
          profileName=${O(o)}
          address=${O(e)}
          icon=${O(s)}
          iconSize="xs"
          .enableGreenCircle=${!1}
          alt=${O(o)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
      </wui-flex>
    `}initializeNamespace(){const e=f.state.activeChain;this.namespace=e,this.caipAddress=f.getAccountData(e)?.caipAddress,this.profileName=f.getAccountData(e)?.profileName??null,this.unsubscribe.push(f.subscribeChainProp("accountState",n=>this.onAccountStateChanged(n),e))}async fetchTokens(){if(this.namespace){let e;if(this.caipAddress){const{chainId:n,chainNamespace:i}=D.parseCaipAddress(this.caipAddress),s=`${i}:${n}`;e=f.getAllRequestedCaipNetworks().find(r=>r.caipNetworkId===s)}await p.fetchTokens({caipAddress:this.caipAddress,caipNetwork:e,namespace:this.namespace})}}fetchQuote(){if(this.amount&&this.recipient&&this.selectedPaymentAsset&&this.paymentAsset){const{address:e}=this.caipAddress?D.parseCaipAddress(this.caipAddress):{};p.fetchQuote({amount:this.amount.toString(),address:e,sourceToken:this.selectedPaymentAsset,toToken:this.paymentAsset,recipient:this.recipient})}}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};const n=this.activeConnectorIds[e];if(!n)return{name:void 0,image:void 0};const i=q.getConnector({id:n,namespace:e});if(!i)return{name:void 0,image:void 0};const s=Q.getConnectorImage(i);return{name:i.name,image:s}}paymentOptionsViewTemplate(){return h`
      <wui-flex flexDirection="column" gap="2">
        <wui-text variant="sm-regular" color="secondary">CHOOSE PAYMENT OPTION</wui-text>
        <wui-flex class="pay-options-container">${this.paymentOptionsTemplate()}</wui-flex>
      </wui-flex>
    `}paymentOptionsTemplate(){const e=this.getPaymentAssetFromTokenBalances();if(this.isFetchingTokenBalances)return h`<w3m-pay-options-skeleton></w3m-pay-options-skeleton>`;if(e.length===0)return h`<w3m-pay-options-empty
        @connectOtherWallet=${this.onConnectOtherWallet.bind(this)}
      ></w3m-pay-options-empty>`;const n={disabled:this.isFetchingQuote};return h`<w3m-pay-options
      class=${ti(n)}
      .options=${e}
      .selectedPaymentAsset=${O(this.selectedPaymentAsset)}
      .onSelect=${this.onSelectedPaymentAssetChanged.bind(this)}
    ></w3m-pay-options>`}amountWithFeeTemplate(){return this.isFetchingQuote||!this.selectedPaymentAsset||this.quoteError?h`<w3m-pay-fees-skeleton></w3m-pay-fees-skeleton>`:h`<w3m-pay-fees></w3m-pay-fees>`}paymentActionsTemplate(){const e=this.isFetchingQuote||this.isFetchingTokenBalances,n=this.isFetchingQuote||this.isFetchingTokenBalances||!this.selectedPaymentAsset||!!this.quoteError,i=k.formatNumber(this.quote?.origin.amount??0,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString();return this.selectedExchange?e||n?h`
          <wui-shimmer width="100%" height="48px" variant="light" ?rounded=${!0}></wui-shimmer>
        `:h`<wui-button
        size="lg"
        fullWidth
        variant="accent-secondary"
        @click=${this.onPayWithExchange.bind(this)}
      >
        ${`Continue in ${this.selectedExchange.name}`}

        <wui-icon name="arrowRight" color="inherit" size="sm" slot="iconRight"></wui-icon>
      </wui-button>`:h`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="md-regular" color="secondary">Order Total</wui-text>

          ${e||n?h`<wui-shimmer width="58px" height="32px" variant="light"></wui-shimmer>`:h`<wui-flex alignItems="center" gap="01">
                <wui-text variant="h4-regular" color="primary">${vt(i)}</wui-text>

                <wui-text variant="lg-regular" color="secondary">
                  ${this.quote?.origin.currency.metadata.symbol||"Unknown"}
                </wui-text>
              </wui-flex>`}
        </wui-flex>

        ${this.actionButtonTemplate({isLoading:e,isDisabled:n})}
      </wui-flex>
    `}actionButtonTemplate(e){const n=Nt(this.quote),{isLoading:i,isDisabled:s}=e;let o="Pay";return n.length>1&&this.completedTransactionsCount===0&&(o="Approve"),h`
      <wui-button
        size="lg"
        variant="accent-primary"
        ?loading=${i||this.isPaymentInProgress}
        ?disabled=${s||this.isPaymentInProgress}
        @click=${()=>{n.length>0?this.onSendTransactions():this.onTransfer()}}
      >
        ${o}
        ${i?null:h`<wui-icon
              name="arrowRight"
              color="inherit"
              size="sm"
              slot="iconRight"
            ></wui-icon>`}
      </wui-button>
    `}getPaymentAssetFromTokenBalances(){return this.namespace?(this.tokenBalances[this.namespace]??[]).map(s=>{try{return _o(s)}catch{return null}}).filter(s=>!!s).filter(s=>{const{chainId:o}=D.parseCaipNetworkId(s.network),{chainId:r}=D.parseCaipNetworkId(this.paymentAsset.network);return se.isLowerCaseMatch(s.asset,this.paymentAsset.asset)?!0:this.selectedExchange?!se.isLowerCaseMatch(o.toString(),r.toString()):!0}):[]}onTokenBalancesChanged(e){this.tokenBalances=e;const[n]=this.getPaymentAssetFromTokenBalances();n&&p.setSelectedPaymentAsset(n)}async onConnectOtherWallet(){await q.connect(),await H.open({view:"PayQuote"})}onAccountStateChanged(e){const{address:n}=this.caipAddress?D.parseCaipAddress(this.caipAddress):{};if(this.caipAddress=e?.caipAddress,this.profileName=e?.profileName??null,n){const{address:i}=this.caipAddress?D.parseCaipAddress(this.caipAddress):{};i?se.isLowerCaseMatch(i,n)||(this.resetAssetsState(),this.resetQuoteState(),this.fetchTokens()):H.close()}}onSelectedPaymentAssetChanged(e){this.isFetchingQuote||p.setSelectedPaymentAsset(e)}async onTransfer(){const e=Lt(this.quote);if(e){if(!se.isLowerCaseMatch(this.selectedPaymentAsset?.asset,e.deposit.currency))throw new Error("Quote asset is not the same as the selected payment asset");const i=this.selectedPaymentAsset?.amount??"0",s=k.formatNumber(e.deposit.amount,{decimals:this.selectedPaymentAsset?.metadata.decimals??0}).toString();if(!k.bigNumber(i).gte(s)){C.showError("Insufficient funds");return}if(this.quote&&this.selectedPaymentAsset&&this.caipAddress&&this.namespace){const{address:r}=D.parseCaipAddress(this.caipAddress);await p.onTransfer({chainNamespace:this.namespace,fromAddress:r,toAddress:e.deposit.receiver,amount:s,paymentAsset:this.selectedPaymentAsset}),p.setRequestId(e.requestId),m.push("PayLoading")}}}async onSendTransactions(){const e=this.selectedPaymentAsset?.amount??"0",n=k.formatNumber(this.quote?.origin.amount??0,{decimals:this.selectedPaymentAsset?.metadata.decimals??0}).toString();if(!k.bigNumber(e).gte(n)){C.showError("Insufficient funds");return}const s=Nt(this.quote),[o]=Nt(this.quote,this.completedTransactionsCount);o&&this.namespace&&(await p.onSendTransaction({namespace:this.namespace,transactionStep:o}),this.completedTransactionsCount+=1,this.completedTransactionsCount===s.length&&(p.setRequestId(o.requestId),m.push("PayLoading")))}onPayWithExchange(){if(this.exchangeUrlForQuote){const e=ee.returnOpenHref("","popupWindow","scrollbar=yes,width=480,height=720");if(!e)throw new Error("Could not create popup window");e.location.href=this.exchangeUrlForQuote;const n=Lt(this.quote);n&&p.setRequestId(n.requestId),p.initiatePayment(),m.push("PayLoading")}}resetAssetsState(){p.setSelectedPaymentAsset(null)}resetQuoteState(){p.resetQuoteState()}};W.styles=os;z([v()],W.prototype,"profileName",void 0);z([v()],W.prototype,"paymentAsset",void 0);z([v()],W.prototype,"namespace",void 0);z([v()],W.prototype,"caipAddress",void 0);z([v()],W.prototype,"amount",void 0);z([v()],W.prototype,"recipient",void 0);z([v()],W.prototype,"activeConnectorIds",void 0);z([v()],W.prototype,"selectedPaymentAsset",void 0);z([v()],W.prototype,"selectedExchange",void 0);z([v()],W.prototype,"isFetchingQuote",void 0);z([v()],W.prototype,"quoteError",void 0);z([v()],W.prototype,"quote",void 0);z([v()],W.prototype,"isFetchingTokenBalances",void 0);z([v()],W.prototype,"tokenBalances",void 0);z([v()],W.prototype,"isPaymentInProgress",void 0);z([v()],W.prototype,"exchangeUrlForQuote",void 0);z([v()],W.prototype,"completedTransactionsCount",void 0);W=z([A("w3m-pay-quote-view")],W);const rs=E`
  wui-image {
    border-radius: ${({borderRadius:t})=>t.round};
  }

  .transfers-badge {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border: 1px solid ${({tokens:t})=>t.theme.foregroundSecondary};
    border-radius: ${({borderRadius:t})=>t[4]};
  }
`;var sn=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let et=class extends Y{constructor(){super(),this.unsubscribe=[],this.paymentAsset=p.state.paymentAsset,this.amount=p.state.amount,this.unsubscribe.push(p.subscribeKey("paymentAsset",e=>{this.paymentAsset=e}),p.subscribeKey("amount",e=>{this.amount=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const n=f.getAllRequestedCaipNetworks().find(i=>i.caipNetworkId===this.paymentAsset.network);return u`<wui-flex
      alignItems="center"
      gap="1"
      .padding=${["1","2","1","1"]}
      class="transfers-badge"
    >
      <wui-image src=${ye(this.paymentAsset.metadata.logoURI)} size="xl"></wui-image>
      <wui-text variant="lg-regular" color="primary">
        ${this.amount} ${this.paymentAsset.metadata.symbol}
      </wui-text>
      <wui-text variant="sm-regular" color="secondary">
        on ${n?.name??"Unknown"}
      </wui-text>
    </wui-flex>`}};et.styles=[rs];sn([I()],et.prototype,"paymentAsset",void 0);sn([I()],et.prototype,"amount",void 0);et=sn([A("w3m-pay-header")],et);const as=E`
  :host {
    height: 60px;
  }

  :host > wui-flex {
    box-sizing: border-box;
    background-color: var(--local-header-background-color);
  }

  wui-text {
    background-color: var(--local-header-background-color);
  }

  wui-flex.w3m-header-title {
    transform: translateY(0);
    opacity: 1;
  }

  wui-flex.w3m-header-title[view-direction='prev'] {
    animation:
      slide-down-out 120ms forwards ${({easings:t})=>t["ease-out-power-2"]},
      slide-down-in 120ms forwards ${({easings:t})=>t["ease-out-power-2"]};
    animation-delay: 0ms, 200ms;
  }

  wui-flex.w3m-header-title[view-direction='next'] {
    animation:
      slide-up-out 120ms forwards ${({easings:t})=>t["ease-out-power-2"]},
      slide-up-in 120ms forwards ${({easings:t})=>t["ease-out-power-2"]};
    animation-delay: 0ms, 200ms;
  }

  wui-icon-button[data-hidden='true'] {
    opacity: 0 !important;
    pointer-events: none;
  }

  @keyframes slide-up-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(3px);
      opacity: 0;
    }
  }

  @keyframes slide-up-in {
    from {
      transform: translateY(-3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-down-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(-3px);
      opacity: 0;
    }
  }

  @keyframes slide-down-in {
    from {
      transform: translateY(3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;var Ce=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};const cs=["SmartSessionList"],ls={PayWithExchange:Ye.tokens.theme.foregroundPrimary};function On(){const t=m.state.data?.connector?.name,e=m.state.data?.wallet?.name,n=m.state.data?.network?.name,i=e??t,s=q.getConnectors(),o=s.length===1&&s[0]?.id==="w3m-email",r=f.getAccountData()?.socialProvider,a=r?r.charAt(0).toUpperCase()+r.slice(1):"Connect Social";return{Connect:`Connect ${o?"Email":""} Wallet`,Create:"Create Wallet",ChooseAccountName:void 0,Account:void 0,AccountSettings:void 0,AllWallets:"All Wallets",ApproveTransaction:"Approve Transaction",BuyInProgress:"Buy",UsageExceeded:"Usage Exceeded",ConnectingExternal:i??"Connect Wallet",ConnectingWalletConnect:i??"WalletConnect",ConnectingWalletConnectBasic:"WalletConnect",ConnectingSiwe:"Sign In",Convert:"Convert",ConvertSelectToken:"Select token",ConvertPreview:"Preview Convert",Downloads:i?`Get ${i}`:"Downloads",EmailLogin:"Email Login",EmailVerifyOtp:"Confirm Email",EmailVerifyDevice:"Register Device",GetWallet:"Get a Wallet",Networks:"Choose Network",OnRampProviders:"Choose Provider",OnRampActivity:"Activity",OnRampTokenSelect:"Select Token",OnRampFiatSelect:"Select Currency",Pay:"How you pay",ProfileWallets:"Wallets",SwitchNetwork:n??"Switch Network",Transactions:"Activity",UnsupportedChain:"Switch Network",UpgradeEmailWallet:"Upgrade Your Wallet",UpdateEmailWallet:"Edit Email",UpdateEmailPrimaryOtp:"Confirm Current Email",UpdateEmailSecondaryOtp:"Confirm New Email",WhatIsABuy:"What is Buy?",RegisterAccountName:"Choose Name",RegisterAccountNameSuccess:"",WalletReceive:"Receive",WalletCompatibleNetworks:"Compatible Networks",Swap:"Swap",SwapSelectToken:"Select Token",SwapPreview:"Preview Swap",WalletSend:"Send",WalletSendPreview:"Review Send",WalletSendSelectToken:"Select Token",WalletSendConfirmed:"Confirmed",WhatIsANetwork:"What is a network?",WhatIsAWallet:"What is a Wallet?",ConnectWallets:"Connect Wallet",ConnectSocials:"All Socials",ConnectingSocial:a,ConnectingMultiChain:"Select Chain",ConnectingFarcaster:"Farcaster",SwitchActiveChain:"Switch Chain",SmartSessionCreated:void 0,SmartSessionList:"Smart Sessions",SIWXSignMessage:"Sign In",PayLoading:"Processing payment...",PayQuote:"Payment Quote",DataCapture:"Profile",DataCaptureOtpConfirm:"Confirm Email",FundWallet:"Fund Wallet",PayWithExchange:"Deposit from Exchange",PayWithExchangeSelectAsset:"Select Asset",SmartAccountSettings:"Smart Account Settings"}}let de=class extends Y{constructor(){super(),this.unsubscribe=[],this.heading=On()[m.state.view],this.network=f.state.activeCaipNetwork,this.networkImage=Q.getNetworkImage(this.network),this.showBack=!1,this.prevHistoryLength=1,this.view=m.state.view,this.viewDirection="",this.unsubscribe.push(hi.subscribeNetworkImages(()=>{this.networkImage=Q.getNetworkImage(this.network)}),m.subscribeKey("view",e=>{setTimeout(()=>{this.view=e,this.heading=On()[e]},Ie.ANIMATION_DURATIONS.HeaderText),this.onViewChange(),this.onHistoryChange()}),f.subscribeKey("activeCaipNetwork",e=>{this.network=e,this.networkImage=Q.getNetworkImage(this.network)}))}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){const e=ls[m.state.view]??Ye.tokens.theme.backgroundPrimary;return this.style.setProperty("--local-header-background-color",e),u`
      <wui-flex
        .padding=${["0","4","0","4"]}
        justifyContent="space-between"
        alignItems="center"
      >
        ${this.leftHeaderTemplate()} ${this.titleTemplate()} ${this.rightHeaderTemplate()}
      </wui-flex>
    `}onWalletHelp(){K.sendEvent({type:"track",event:"CLICK_WALLET_HELP"}),m.push("WhatIsAWallet")}async onClose(){await qn.safeClose()}rightHeaderTemplate(){const e=N?.state?.features?.smartSessions;return m.state.view!=="Account"||!e?this.closeButtonTemplate():u`<wui-flex>
      <wui-icon-button
        icon="clock"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${()=>m.push("SmartSessionList")}
        data-testid="w3m-header-smart-sessions"
      ></wui-icon-button>
      ${this.closeButtonTemplate()}
    </wui-flex> `}closeButtonTemplate(){return u`
      <wui-icon-button
        icon="close"
        size="lg"
        type="neutral"
        variant="primary"
        iconSize="lg"
        @click=${this.onClose.bind(this)}
        data-testid="w3m-header-close"
      ></wui-icon-button>
    `}titleTemplate(){if(this.view==="PayQuote")return u`<w3m-pay-header></w3m-pay-header>`;const e=cs.includes(this.view);return u`
      <wui-flex
        view-direction="${this.viewDirection}"
        class="w3m-header-title"
        alignItems="center"
        gap="2"
      >
        <wui-text
          display="inline"
          variant="lg-regular"
          color="primary"
          data-testid="w3m-header-text"
        >
          ${this.heading}
        </wui-text>
        ${e?u`<wui-tag variant="accent" size="md">Beta</wui-tag>`:null}
      </wui-flex>
    `}leftHeaderTemplate(){const{view:e}=m.state,n=e==="Connect",i=N.state.enableEmbedded,s=e==="ApproveTransaction",o=e==="ConnectingSiwe",r=e==="Account",a=N.state.enableNetworkSwitch,d=s||o||n&&i;return r&&a?u`<wui-select
        id="dynamic"
        data-testid="w3m-account-select-network"
        active-network=${ye(this.network?.name)}
        @click=${this.onNetworks.bind(this)}
        imageSrc=${ye(this.networkImage)}
      ></wui-select>`:this.showBack&&!d?u`<wui-icon-button
        data-testid="header-back"
        id="dynamic"
        icon="chevronLeft"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${this.onGoBack.bind(this)}
      ></wui-icon-button>`:u`<wui-icon-button
      data-hidden=${!n}
      id="dynamic"
      icon="helpCircle"
      size="lg"
      iconSize="lg"
      type="neutral"
      variant="primary"
      @click=${this.onWalletHelp.bind(this)}
    ></wui-icon-button>`}onNetworks(){this.isAllowedNetworkSwitch()&&(K.sendEvent({type:"track",event:"CLICK_NETWORKS"}),m.push("Networks"))}isAllowedNetworkSwitch(){const e=f.getAllRequestedCaipNetworks(),n=e?e.length>1:!1,i=e?.find(({id:s})=>s===this.network?.id);return n||!i}onViewChange(){const{history:e}=m.state;let n=Ie.VIEW_DIRECTION.Next;e.length<this.prevHistoryLength&&(n=Ie.VIEW_DIRECTION.Prev),this.prevHistoryLength=e.length,this.viewDirection=n}async onHistoryChange(){const{history:e}=m.state,n=this.shadowRoot?.querySelector("#dynamic");e.length>1&&!this.showBack&&n?(await n.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!0,n.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"})):e.length<=1&&this.showBack&&n&&(await n.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!1,n.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}onGoBack(){m.goBack()}};de.styles=as;Ce([S()],de.prototype,"heading",void 0);Ce([S()],de.prototype,"network",void 0);Ce([S()],de.prototype,"networkImage",void 0);Ce([S()],de.prototype,"showBack",void 0);Ce([S()],de.prototype,"prevHistoryLength",void 0);Ce([S()],de.prototype,"view",void 0);Ce([S()],de.prototype,"viewDirection",void 0);de=Ce([A("w3m-header")],de);const us=E`
  :host {
    display: flex;
    align-items: center;
    gap: ${({spacing:t})=>t[1]};
    padding: ${({spacing:t})=>t[2]} ${({spacing:t})=>t[3]}
      ${({spacing:t})=>t[2]} ${({spacing:t})=>t[2]};
    border-radius: ${({borderRadius:t})=>t[20]};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    box-shadow:
      0px 0px 8px 0px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px ${({tokens:t})=>t.theme.borderPrimary};
    max-width: 320px;
  }

  wui-icon-box {
    border-radius: ${({borderRadius:t})=>t.round} !important;
    overflow: hidden;
  }

  wui-loading-spinner {
    padding: ${({spacing:t})=>t[1]};
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
    border-radius: ${({borderRadius:t})=>t.round} !important;
  }
`;var rn=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let tt=class extends he{constructor(){super(...arguments),this.message="",this.variant="success"}render(){return P`
      ${this.templateIcon()}
      <wui-text variant="lg-regular" color="primary" data-testid="wui-snackbar-message"
        >${this.message}</wui-text
      >
    `}templateIcon(){const e={success:"success",error:"error",warning:"warning",info:"default"},n={success:"checkmark",error:"warning",warning:"warningCircle",info:"info"};return this.variant==="loading"?P`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:P`<wui-icon-box
      size="md"
      color=${e[this.variant]}
      icon=${n[this.variant]}
    ></wui-icon-box>`}};tt.styles=[pe,us];rn([y()],tt.prototype,"message",void 0);rn([y()],tt.prototype,"variant",void 0);tt=rn([A("wui-snackbar")],tt);const ds=qt`
  :host {
    display: block;
    position: absolute;
    opacity: 0;
    pointer-events: none;
    top: 11px;
    left: 50%;
    width: max-content;
  }
`;var oi=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let At=class extends Y{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.open=C.state.open,this.unsubscribe.push(C.subscribeKey("open",e=>{this.open=e,this.onOpen()}))}disconnectedCallback(){clearTimeout(this.timeout),this.unsubscribe.forEach(e=>e())}render(){const{message:e,variant:n}=C.state;return u` <wui-snackbar message=${e} variant=${n}></wui-snackbar> `}onOpen(){clearTimeout(this.timeout),this.open?(this.animate([{opacity:0,transform:"translateX(-50%) scale(0.85)"},{opacity:1,transform:"translateX(-50%) scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.timeout&&clearTimeout(this.timeout),C.state.autoClose&&(this.timeout=setTimeout(()=>C.hide(),2500))):this.animate([{opacity:1,transform:"translateX(-50%) scale(1)"},{opacity:0,transform:"translateX(-50%) scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"})}};At.styles=ds;oi([S()],At.prototype,"open",void 0);At=oi([A("w3m-snackbar")],At);const ps=qt`
  :host {
    width: 100%;
    display: block;
  }
`;var an=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let nt=class extends Y{constructor(){super(),this.unsubscribe=[],this.text="",this.open=J.state.open,this.unsubscribe.push(m.subscribeKey("view",()=>{J.hide()}),H.subscribeKey("open",e=>{e||J.hide()}),J.subscribeKey("open",e=>{this.open=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),J.hide()}render(){return u`
      <div
        @pointermove=${this.onMouseEnter.bind(this)}
        @pointerleave=${this.onMouseLeave.bind(this)}
      >
        ${this.renderChildren()}
      </div>
    `}renderChildren(){return u`<slot></slot> `}onMouseEnter(){const e=this.getBoundingClientRect();if(!this.open){const n=document.querySelector("w3m-modal"),i={width:e.width,height:e.height,left:e.left,top:e.top};if(n){const s=n.getBoundingClientRect();i.left=e.left-(window.innerWidth-s.width)/2,i.top=e.top-(window.innerHeight-s.height)/2}J.showTooltip({message:this.text,triggerRect:i,variant:"shade"})}}onMouseLeave(e){this.contains(e.relatedTarget)||J.hide()}};nt.styles=[ps];an([I()],nt.prototype,"text",void 0);an([S()],nt.prototype,"open",void 0);nt=an([A("w3m-tooltip-trigger")],nt);const hs=E`
  :host {
    pointer-events: none;
  }

  :host > wui-flex {
    display: var(--w3m-tooltip-display);
    opacity: var(--w3m-tooltip-opacity);
    padding: 9px ${({spacing:t})=>t[3]} 10px ${({spacing:t})=>t[3]};
    border-radius: ${({borderRadius:t})=>t[3]};
    color: ${({tokens:t})=>t.theme.backgroundPrimary};
    position: absolute;
    top: var(--w3m-tooltip-top);
    left: var(--w3m-tooltip-left);
    transform: translate(calc(-50% + var(--w3m-tooltip-parent-width)), calc(-100% - 8px));
    max-width: calc(var(--apkt-modal-width) - ${({spacing:t})=>t[5]});
    transition: opacity ${({durations:t})=>t.lg}
      ${({easings:t})=>t["ease-out-power-2"]};
    will-change: opacity;
    opacity: 0;
    animation-duration: ${({durations:t})=>t.xl};
    animation-timing-function: ${({easings:t})=>t["ease-out-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  :host([data-variant='shade']) > wui-flex {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  :host([data-variant='shade']) > wui-flex > wui-text {
    color: ${({tokens:t})=>t.theme.textSecondary};
  }

  :host([data-variant='fill']) > wui-flex {
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    border: 1px solid ${({tokens:t})=>t.theme.borderPrimary};
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
    color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;var at=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let Oe=class extends Y{constructor(){super(),this.unsubscribe=[],this.open=J.state.open,this.message=J.state.message,this.triggerRect=J.state.triggerRect,this.variant=J.state.variant,this.unsubscribe.push(J.subscribe(e=>{this.open=e.open,this.message=e.message,this.triggerRect=e.triggerRect,this.variant=e.variant}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){this.dataset.variant=this.variant;const e=this.triggerRect.top,n=this.triggerRect.left;return this.style.cssText=`
    --w3m-tooltip-top: ${e}px;
    --w3m-tooltip-left: ${n}px;
    --w3m-tooltip-parent-width: ${this.triggerRect.width/2}px;
    --w3m-tooltip-display: ${this.open?"flex":"none"};
    --w3m-tooltip-opacity: ${this.open?1:0};
    `,u`<wui-flex>
      <wui-icon data-placement="top" size="inherit" name="cursor"></wui-icon>
      <wui-text color="primary" variant="sm-regular">${this.message}</wui-text>
    </wui-flex>`}};Oe.styles=[hs];at([S()],Oe.prototype,"open",void 0);at([S()],Oe.prototype,"message",void 0);at([S()],Oe.prototype,"triggerRect",void 0);at([S()],Oe.prototype,"variant",void 0);Oe=at([A("w3m-tooltip")],Oe);const Ge={getTabsByNamespace(t){return!!t&&t===U.CHAIN.EVM?N.state.remoteFeatures?.activity===!1?Ie.ACCOUNT_TABS.filter(n=>n.label!=="Activity"):Ie.ACCOUNT_TABS:[]},isValidReownName(t){return/^[a-zA-Z0-9]+$/gu.test(t)},isValidEmail(t){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/gu.test(t)},validateReownName(t){return t.replace(/\^/gu,"").toLowerCase().replace(/[^a-zA-Z0-9]/gu,"")},hasFooter(){const t=m.state.view;if(Ie.VIEWS_WITH_LEGAL_FOOTER.includes(t)){const{termsConditionsUrl:e,privacyPolicyUrl:n}=N.state,i=N.state.features?.legalCheckbox;return!(!e&&!n||i)}return Ie.VIEWS_WITH_DEFAULT_FOOTER.includes(t)}},ms=E`
  :host wui-ux-by-reown {
    padding-top: 0;
  }

  :host wui-ux-by-reown.branding-only {
    padding-top: ${({spacing:t})=>t[3]};
  }

  a {
    text-decoration: none;
    color: ${({tokens:t})=>t.core.textAccentPrimary};
    font-weight: 500;
  }
`;var si=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let $t=class extends Y{constructor(){super(),this.unsubscribe=[],this.remoteFeatures=N.state.remoteFeatures,this.unsubscribe.push(N.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const{termsConditionsUrl:e,privacyPolicyUrl:n}=N.state,i=N.state.features?.legalCheckbox;return!e&&!n||i?u`
        <wui-flex flexDirection="column"> ${this.reownBrandingTemplate(!0)} </wui-flex>
      `:u`
      <wui-flex flexDirection="column">
        <wui-flex .padding=${["4","3","3","3"]} justifyContent="center">
          <wui-text color="secondary" variant="md-regular" align="center">
            By connecting your wallet, you agree to our <br />
            ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
          </wui-text>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `}andTemplate(){const{termsConditionsUrl:e,privacyPolicyUrl:n}=N.state;return e&&n?"and":""}termsTemplate(){const{termsConditionsUrl:e}=N.state;return e?u`<a href=${e} target="_blank" rel="noopener noreferrer"
      >Terms of Service</a
    >`:null}privacyTemplate(){const{privacyPolicyUrl:e}=N.state;return e?u`<a href=${e} target="_blank" rel="noopener noreferrer"
      >Privacy Policy</a
    >`:null}reownBrandingTemplate(e=!1){return this.remoteFeatures?.reownBranding?e?u`<wui-ux-by-reown class="branding-only"></wui-ux-by-reown>`:u`<wui-ux-by-reown></wui-ux-by-reown>`:null}};$t.styles=[ms];si([S()],$t.prototype,"remoteFeatures",void 0);$t=si([A("w3m-legal-footer")],$t);const ws=qt``;var fs=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let Mt=class extends Y{render(){const{termsConditionsUrl:e,privacyPolicyUrl:n}=N.state;return!e&&!n?null:u`
      <wui-flex
        .padding=${["4","3","3","3"]}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
      >
        <wui-text color="secondary" variant="md-regular" align="center">
          We work with the best providers to give you the lowest fees and best support. More options
          coming soon!
        </wui-text>

        ${this.howDoesItWorkTemplate()}
      </wui-flex>
    `}howDoesItWorkTemplate(){return u` <wui-link @click=${this.onWhatIsBuy.bind(this)}>
      <wui-icon size="xs" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
      How does it work?
    </wui-link>`}onWhatIsBuy(){K.sendEvent({type:"track",event:"SELECT_WHAT_IS_A_BUY",properties:{isSmartAccount:dt(f.state.activeChain)===pt.ACCOUNT_TYPES.SMART_ACCOUNT}}),m.push("WhatIsABuy")}};Mt.styles=[ws];Mt=fs([A("w3m-onramp-providers-footer")],Mt);const gs=E`
  :host {
    display: block;
  }

  div.container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    height: auto;
    display: block;
  }

  div.container[status='hide'] {
    animation: fade-out;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:t})=>t["ease-out-power-2"]};
    animation-fill-mode: both;
    animation-delay: 0s;
  }

  div.container[status='show'] {
    animation: fade-in;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:t})=>t["ease-out-power-2"]};
    animation-fill-mode: both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      filter: blur(6px);
    }
    to {
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
      filter: blur(0px);
    }
    to {
      opacity: 0;
      filter: blur(6px);
    }
  }
`;var cn=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let it=class extends Y{constructor(){super(...arguments),this.resizeObserver=void 0,this.unsubscribe=[],this.status="hide",this.view=m.state.view}firstUpdated(){this.status=Ge.hasFooter()?"show":"hide",this.unsubscribe.push(m.subscribeKey("view",e=>{this.view=e,this.status=Ge.hasFooter()?"show":"hide",this.status==="hide"&&document.documentElement.style.setProperty("--apkt-footer-height","0px")})),this.resizeObserver=new ResizeObserver(e=>{for(const n of e)if(n.target===this.getWrapper()){const i=`${n.contentRect.height}px`;document.documentElement.style.setProperty("--apkt-footer-height",i)}}),this.resizeObserver.observe(this.getWrapper())}render(){return u`
      <div class="container" status=${this.status}>${this.templatePageContainer()}</div>
    `}templatePageContainer(){return Ge.hasFooter()?u` ${this.templateFooter()}`:null}templateFooter(){switch(this.view){case"Networks":return this.templateNetworksFooter();case"Connect":case"ConnectWallets":case"OnRampFiatSelect":case"OnRampTokenSelect":return u`<w3m-legal-footer></w3m-legal-footer>`;case"OnRampProviders":return u`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`;default:return null}}templateNetworksFooter(){return u` <wui-flex
      class="footer-in"
      padding="3"
      flexDirection="column"
      gap="3"
      alignItems="center"
    >
      <wui-text variant="md-regular" color="secondary" align="center">
        Your connected wallet may not support some of the networks available for this dApp
      </wui-text>
      <wui-link @click=${this.onNetworkHelp.bind(this)}>
        <wui-icon size="sm" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
        What is a network
      </wui-link>
    </wui-flex>`}onNetworkHelp(){K.sendEvent({type:"track",event:"CLICK_NETWORK_HELP"}),m.push("WhatIsANetwork")}getWrapper(){return this.shadowRoot?.querySelector("div.container")}};it.styles=[gs];cn([S()],it.prototype,"status",void 0);cn([S()],it.prototype,"view",void 0);it=cn([A("w3m-footer")],it);const ys=E`
  :host {
    display: block;
    width: inherit;
  }
`;var ln=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let ot=class extends Y{constructor(){super(),this.unsubscribe=[],this.viewState=m.state.view,this.history=m.state.history.join(","),this.unsubscribe.push(m.subscribeKey("view",()=>{this.history=m.state.history.join(","),document.documentElement.style.setProperty("--apkt-duration-dynamic","var(--apkt-durations-lg)")}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),document.documentElement.style.setProperty("--apkt-duration-dynamic","0s")}render(){return u`${this.templatePageContainer()}`}templatePageContainer(){return u`<w3m-router-container
      history=${this.history}
      .setView=${()=>{this.viewState=m.state.view}}
    >
      ${this.viewTemplate(this.viewState)}
    </w3m-router-container>`}viewTemplate(e){switch(e){case"AccountSettings":return u`<w3m-account-settings-view></w3m-account-settings-view>`;case"Account":return u`<w3m-account-view></w3m-account-view>`;case"AllWallets":return u`<w3m-all-wallets-view></w3m-all-wallets-view>`;case"ApproveTransaction":return u`<w3m-approve-transaction-view></w3m-approve-transaction-view>`;case"BuyInProgress":return u`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`;case"ChooseAccountName":return u`<w3m-choose-account-name-view></w3m-choose-account-name-view>`;case"Connect":return u`<w3m-connect-view></w3m-connect-view>`;case"Create":return u`<w3m-connect-view walletGuide="explore"></w3m-connect-view>`;case"ConnectingWalletConnect":return u`<w3m-connecting-wc-view></w3m-connecting-wc-view>`;case"ConnectingWalletConnectBasic":return u`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`;case"ConnectingExternal":return u`<w3m-connecting-external-view></w3m-connecting-external-view>`;case"ConnectingSiwe":return u`<w3m-connecting-siwe-view></w3m-connecting-siwe-view>`;case"ConnectWallets":return u`<w3m-connect-wallets-view></w3m-connect-wallets-view>`;case"ConnectSocials":return u`<w3m-connect-socials-view></w3m-connect-socials-view>`;case"ConnectingSocial":return u`<w3m-connecting-social-view></w3m-connecting-social-view>`;case"DataCapture":return u`<w3m-data-capture-view></w3m-data-capture-view>`;case"DataCaptureOtpConfirm":return u`<w3m-data-capture-otp-confirm-view></w3m-data-capture-otp-confirm-view>`;case"Downloads":return u`<w3m-downloads-view></w3m-downloads-view>`;case"EmailLogin":return u`<w3m-email-login-view></w3m-email-login-view>`;case"EmailVerifyOtp":return u`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`;case"EmailVerifyDevice":return u`<w3m-email-verify-device-view></w3m-email-verify-device-view>`;case"GetWallet":return u`<w3m-get-wallet-view></w3m-get-wallet-view>`;case"Networks":return u`<w3m-networks-view></w3m-networks-view>`;case"SwitchNetwork":return u`<w3m-network-switch-view></w3m-network-switch-view>`;case"ProfileWallets":return u`<w3m-profile-wallets-view></w3m-profile-wallets-view>`;case"Transactions":return u`<w3m-transactions-view></w3m-transactions-view>`;case"OnRampProviders":return u`<w3m-onramp-providers-view></w3m-onramp-providers-view>`;case"OnRampTokenSelect":return u`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`;case"OnRampFiatSelect":return u`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`;case"UpgradeEmailWallet":return u`<w3m-upgrade-wallet-view></w3m-upgrade-wallet-view>`;case"UpdateEmailWallet":return u`<w3m-update-email-wallet-view></w3m-update-email-wallet-view>`;case"UpdateEmailPrimaryOtp":return u`<w3m-update-email-primary-otp-view></w3m-update-email-primary-otp-view>`;case"UpdateEmailSecondaryOtp":return u`<w3m-update-email-secondary-otp-view></w3m-update-email-secondary-otp-view>`;case"UnsupportedChain":return u`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`;case"Swap":return u`<w3m-swap-view></w3m-swap-view>`;case"SwapSelectToken":return u`<w3m-swap-select-token-view></w3m-swap-select-token-view>`;case"SwapPreview":return u`<w3m-swap-preview-view></w3m-swap-preview-view>`;case"WalletSend":return u`<w3m-wallet-send-view></w3m-wallet-send-view>`;case"WalletSendSelectToken":return u`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`;case"WalletSendPreview":return u`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`;case"WalletSendConfirmed":return u`<w3m-send-confirmed-view></w3m-send-confirmed-view>`;case"WhatIsABuy":return u`<w3m-what-is-a-buy-view></w3m-what-is-a-buy-view>`;case"WalletReceive":return u`<w3m-wallet-receive-view></w3m-wallet-receive-view>`;case"WalletCompatibleNetworks":return u`<w3m-wallet-compatible-networks-view></w3m-wallet-compatible-networks-view>`;case"WhatIsAWallet":return u`<w3m-what-is-a-wallet-view></w3m-what-is-a-wallet-view>`;case"ConnectingMultiChain":return u`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`;case"WhatIsANetwork":return u`<w3m-what-is-a-network-view></w3m-what-is-a-network-view>`;case"ConnectingFarcaster":return u`<w3m-connecting-farcaster-view></w3m-connecting-farcaster-view>`;case"SwitchActiveChain":return u`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`;case"RegisterAccountName":return u`<w3m-register-account-name-view></w3m-register-account-name-view>`;case"RegisterAccountNameSuccess":return u`<w3m-register-account-name-success-view></w3m-register-account-name-success-view>`;case"SmartSessionCreated":return u`<w3m-smart-session-created-view></w3m-smart-session-created-view>`;case"SmartSessionList":return u`<w3m-smart-session-list-view></w3m-smart-session-list-view>`;case"SIWXSignMessage":return u`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`;case"Pay":return u`<w3m-pay-view></w3m-pay-view>`;case"PayLoading":return u`<w3m-pay-loading-view></w3m-pay-loading-view>`;case"PayQuote":return u`<w3m-pay-quote-view></w3m-pay-quote-view>`;case"FundWallet":return u`<w3m-fund-wallet-view></w3m-fund-wallet-view>`;case"PayWithExchange":return u`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`;case"PayWithExchangeSelectAsset":return u`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`;case"UsageExceeded":return u`<w3m-usage-exceeded-view></w3m-usage-exceeded-view>`;case"SmartAccountSettings":return u`<w3m-smart-account-settings-view></w3m-smart-account-settings-view>`;default:return u`<w3m-connect-view></w3m-connect-view>`}}};ot.styles=[ys];ln([S()],ot.prototype,"viewState",void 0);ln([S()],ot.prototype,"history",void 0);ot=ln([A("w3m-router")],ot);const bs=E`
  :host {
    z-index: ${({tokens:t})=>t.core.zIndex};
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: ${({tokens:t})=>t.theme.overlay};
    backdrop-filter: blur(0px);
    transition:
      opacity ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]},
      backdrop-filter ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]};
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  :host(.appkit-modal) {
    position: relative;
    pointer-events: unset;
    background: none;
    width: 100%;
    opacity: 1;
  }

  wui-card {
    max-width: var(--apkt-modal-width);
    width: 100%;
    position: relative;
    outline: none;
    transform: translateY(4px);
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
    transition:
      transform ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      border-radius ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-1"]},
      background-color ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-1"]},
      box-shadow ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-1"]};
    will-change: border-radius, background-color, transform, box-shadow;
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    padding: var(--local-modal-padding);
    box-sizing: border-box;
  }

  :host(.open) wui-card {
    transform: translateY(0px);
  }

  wui-card::before {
    z-index: 1;
    pointer-events: none;
    content: '';
    position: absolute;
    inset: 0;
    border-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    transition: box-shadow ${({durations:t})=>t.lg}
      ${({easings:t})=>t["ease-out-power-2"]};
    transition-delay: ${({durations:t})=>t.md};
    will-change: box-shadow;
  }

  :host([data-mobile-fullscreen='true']) wui-card::before {
    border-radius: 0px;
  }

  :host([data-border='true']) wui-card::before {
    box-shadow: inset 0px 0px 0px 4px ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  :host([data-border='false']) wui-card::before {
    box-shadow: inset 0px 0px 0px 1px ${({tokens:t})=>t.theme.borderPrimaryDark};
  }

  :host([data-border='true']) wui-card {
    animation:
      fade-in ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]},
      card-background-border var(--apkt-duration-dynamic)
        ${({easings:t})=>t["ease-out-power-2"]};
    animation-fill-mode: backwards, both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  :host([data-border='false']) wui-card {
    animation:
      fade-in ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]},
      card-background-default var(--apkt-duration-dynamic)
        ${({easings:t})=>t["ease-out-power-2"]};
    animation-fill-mode: backwards, both;
    animation-delay: 0s;
  }

  :host(.appkit-modal) wui-card {
    max-width: var(--apkt-modal-width);
  }

  wui-card[shake='true'] {
    animation:
      fade-in ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]},
      w3m-shake ${({durations:t})=>t.xl}
        ${({easings:t})=>t["ease-out-power-2"]};
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--apkt-spacing-6) 0px;
    }
  }

  @media (max-width: 430px) {
    :host([data-mobile-fullscreen='true']) {
      height: 100dvh;
    }
    :host([data-mobile-fullscreen='true']) wui-flex {
      align-items: stretch;
    }
    :host([data-mobile-fullscreen='true']) wui-card {
      max-width: 100%;
      height: 100%;
      border-radius: 0;
      border: none;
    }
    :host(:not([data-mobile-fullscreen='true'])) wui-flex {
      align-items: flex-end;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card {
      max-width: 100%;
      border-bottom: none;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card[data-embedded='true'] {
      border-bottom-left-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
      border-bottom-right-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card:not([data-embedded='true']) {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }

    wui-card[shake='true'] {
      animation: w3m-shake 0.5s ${({easings:t})=>t["ease-out-power-2"]};
    }
  }

  @keyframes fade-in {
    0% {
      transform: scale(0.99) translateY(4px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes card-background-border {
    from {
      background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    }
    to {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }
  }

  @keyframes card-background-default {
    from {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }
    to {
      background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    }
  }
`;var we=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};const Un="scroll-lock",vs={PayWithExchange:"0",PayWithExchangeSelectAsset:"0",Pay:"0",PayQuote:"0",PayLoading:"0"};class ae extends Y{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.hasPrefetched=!1,this.enableEmbedded=N.state.enableEmbedded,this.open=H.state.open,this.caipAddress=f.state.activeCaipAddress,this.caipNetwork=f.state.activeCaipNetwork,this.shake=H.state.shake,this.filterByNamespace=q.state.filterByNamespace,this.padding=Ye.spacing[1],this.mobileFullScreen=N.state.enableMobileFullScreen,this.initializeTheming(),lt.prefetchAnalyticsConfig(),this.unsubscribe.push(H.subscribeKey("open",e=>e?this.onOpen():this.onClose()),H.subscribeKey("shake",e=>this.shake=e),f.subscribeKey("activeCaipNetwork",e=>this.onNewNetwork(e)),f.subscribeKey("activeCaipAddress",e=>this.onNewAddress(e)),N.subscribeKey("enableEmbedded",e=>this.enableEmbedded=e),q.subscribeKey("filterByNamespace",e=>{this.filterByNamespace!==e&&!f.getAccountData(e)?.caipAddress&&(lt.fetchRecommendedWallets(),this.filterByNamespace=e)}),m.subscribeKey("view",()=>{this.dataset.border=Ge.hasFooter()?"true":"false",this.padding=vs[m.state.view]??Ye.spacing[1]}))}firstUpdated(){if(this.dataset.border=Ge.hasFooter()?"true":"false",this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),this.caipAddress){if(this.enableEmbedded){H.close(),this.prefetch();return}this.onNewAddress(this.caipAddress)}this.open&&this.onOpen(),this.enableEmbedded&&this.prefetch()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.onRemoveKeyboardListener()}render(){return this.style.setProperty("--local-modal-padding",this.padding),this.enableEmbedded?u`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `:this.open?u`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}contentTemplate(){return u` <wui-card
      shake="${this.shake}"
      data-embedded="${ye(this.enableEmbedded)}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-footer></w3m-footer>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`}async onOverlayClick(e){if(e.target===e.currentTarget){if(this.mobileFullScreen)return;await this.handleClose()}}async handleClose(){await qn.safeClose()}initializeTheming(){const{themeVariables:e,themeMode:n}=mi.state,i=St.getColorTheme(n);wi(e,i)}onClose(){this.open=!1,this.classList.remove("open"),this.onScrollUnlock(),C.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add("open"),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){const e=document.createElement("style");e.dataset.w3m=Un,e.textContent=`
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `,document.head.appendChild(e)}onScrollUnlock(){const e=document.head.querySelector(`style[data-w3m="${Un}"]`);e&&e.remove()}onAddKeyboardListener(){this.abortController=new AbortController;const e=this.shadowRoot?.querySelector("wui-card");e?.focus(),window.addEventListener("keydown",n=>{if(n.key==="Escape")this.handleClose();else if(n.key==="Tab"){const{tagName:i}=n.target;i&&!i.includes("W3M-")&&!i.includes("WUI-")&&e?.focus()}},this.abortController)}onRemoveKeyboardListener(){this.abortController?.abort(),this.abortController=void 0}async onNewAddress(e){const n=f.state.isSwitchingNamespace,i=m.state.view==="ProfileWallets";!e&&!n&&!i&&H.close(),await jn.initializeIfEnabled(e),this.caipAddress=e,f.setIsSwitchingNamespace(!1)}onNewNetwork(e){const i=this.caipNetwork?.caipNetworkId?.toString(),s=e?.caipNetworkId?.toString(),o=i!==s,r=m.state.view==="UnsupportedChain",a=H.state.open;let d=!1;this.enableEmbedded&&m.state.view==="SwitchNetwork"&&(d=!0),o&&w.resetState(),a&&r&&(d=!0),d&&m.state.view!=="SIWXSignMessage"&&m.goBack(),this.caipNetwork=e}prefetch(){this.hasPrefetched||(lt.prefetch(),lt.fetchWalletsByPage({page:1}),this.hasPrefetched=!0)}}ae.styles=bs;we([I({type:Boolean})],ae.prototype,"enableEmbedded",void 0);we([S()],ae.prototype,"open",void 0);we([S()],ae.prototype,"caipAddress",void 0);we([S()],ae.prototype,"caipNetwork",void 0);we([S()],ae.prototype,"shake",void 0);we([S()],ae.prototype,"filterByNamespace",void 0);we([S()],ae.prototype,"padding",void 0);we([S()],ae.prototype,"mobileFullScreen",void 0);let Wn=class extends ae{};Wn=we([A("w3m-modal")],Wn);let Dn=class extends ae{};Dn=we([A("appkit-modal")],Dn);const xs=E`
  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: ${({borderRadius:t})=>t[5]};
    background-color: ${({colors:t})=>t.semanticError010};
  }
`;var ks=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let jt=class extends Y{constructor(){super()}render(){return u`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding="${["1","3","4","3"]}"
      >
        <wui-flex justifyContent="center" alignItems="center" class="icon-box">
          <wui-icon size="xxl" color="error" name="warningCircle"></wui-icon>
        </wui-flex>

        <wui-text variant="lg-medium" color="primary" align="center">
          The app isn't responding as expected
        </wui-text>
        <wui-text variant="md-regular" color="secondary" align="center">
          Try again or reach out to the app team for help.
        </wui-text>

        <wui-button
          variant="neutral-secondary"
          size="md"
          @click=${this.onTryAgainClick.bind(this)}
          data-testid="w3m-usage-exceeded-button"
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try Again
        </wui-button>
      </wui-flex>
    `}onTryAgainClick(){m.goBack()}};jt.styles=xs;jt=ks([A("w3m-usage-exceeded-view")],jt);const As=E`
  :host {
    width: 100%;
  }
`;var M=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};let B=class extends Y{constructor(){super(...arguments),this.hasImpressionSent=!1,this.walletImages=[],this.imageSrc="",this.name="",this.size="md",this.tabIdx=void 0,this.disabled=!1,this.showAllWallets=!1,this.loading=!1,this.loadingSpinnerColor="accent-100",this.rdnsId="",this.displayIndex=void 0,this.walletRank=void 0,this.namespaces=[]}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this.cleanupIntersectionObserver()}updated(e){super.updated(e),(e.has("name")||e.has("imageSrc")||e.has("walletRank"))&&(this.hasImpressionSent=!1),e.has("walletRank")&&this.walletRank&&!this.intersectionObserver&&this.setupIntersectionObserver()}setupIntersectionObserver(){this.intersectionObserver=new IntersectionObserver(e=>{e.forEach(n=>{n.isIntersecting&&!this.loading&&!this.hasImpressionSent&&this.sendImpressionEvent()})},{threshold:.1}),this.intersectionObserver.observe(this)}cleanupIntersectionObserver(){this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=void 0)}sendImpressionEvent(){!this.name||this.hasImpressionSent||!this.walletRank||(this.hasImpressionSent=!0,(this.rdnsId||this.name)&&K.sendWalletImpressionEvent({name:this.name,walletRank:this.walletRank,rdnsId:this.rdnsId,view:m.state.view,displayIndex:this.displayIndex}))}handleGetWalletNamespaces(){return Object.keys(fi.state.adapters).length>1?this.namespaces:[]}render(){return u`
      <wui-list-wallet
        .walletImages=${this.walletImages}
        imageSrc=${ye(this.imageSrc)}
        name=${this.name}
        size=${ye(this.size)}
        tagLabel=${ye(this.tagLabel)}
        .tagVariant=${this.tagVariant}
        .walletIcon=${this.walletIcon}
        .tabIdx=${this.tabIdx}
        .disabled=${this.disabled}
        .showAllWallets=${this.showAllWallets}
        .loading=${this.loading}
        loadingSpinnerColor=${this.loadingSpinnerColor}
        .namespaces=${this.handleGetWalletNamespaces()}
      ></wui-list-wallet>
    `}};B.styles=As;M([I({type:Array})],B.prototype,"walletImages",void 0);M([I()],B.prototype,"imageSrc",void 0);M([I()],B.prototype,"name",void 0);M([I()],B.prototype,"size",void 0);M([I()],B.prototype,"tagLabel",void 0);M([I()],B.prototype,"tagVariant",void 0);M([I()],B.prototype,"walletIcon",void 0);M([I()],B.prototype,"tabIdx",void 0);M([I({type:Boolean})],B.prototype,"disabled",void 0);M([I({type:Boolean})],B.prototype,"showAllWallets",void 0);M([I({type:Boolean})],B.prototype,"loading",void 0);M([I({type:String})],B.prototype,"loadingSpinnerColor",void 0);M([I()],B.prototype,"rdnsId",void 0);M([I()],B.prototype,"displayIndex",void 0);M([I()],B.prototype,"walletRank",void 0);M([I({type:Array})],B.prototype,"namespaces",void 0);B=M([A("w3m-list-wallet")],B);const $s=E`
  :host {
    --local-duration-height: 0s;
    --local-duration: ${({durations:t})=>t.lg};
    --local-transition: ${({easings:t})=>t["ease-out-power-2"]};
  }

  .container {
    display: block;
    overflow: hidden;
    overflow: hidden;
    position: relative;
    height: var(--local-container-height);
    transition: height var(--local-duration-height) var(--local-transition);
    will-change: height, padding-bottom;
  }

  .container[data-mobile-fullscreen='true'] {
    overflow: scroll;
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    width: inherit;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    border-bottom-left-radius: var(--local-border-bottom-radius);
    border-bottom-right-radius: var(--local-border-bottom-radius);
    transition: border-bottom-left-radius var(--local-duration) var(--local-transition);
  }

  .page[data-mobile-fullscreen='true'] {
    height: 100%;
  }

  .page-content {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .footer {
    height: var(--apkt-footer-height);
  }

  div.page[view-direction^='prev-'] .page-content {
    animation:
      slide-left-out var(--local-duration) forwards var(--local-transition),
      slide-left-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:t})=>t.lg});
  }

  div.page[view-direction^='next-'] .page-content {
    animation:
      slide-right-out var(--local-duration) forwards var(--local-transition),
      slide-right-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:t})=>t.lg});
  }

  @keyframes slide-left-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-left-in {
    from {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes slide-right-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-right-in {
    from {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }
`;var fe=function(t,e,n,i){var s=arguments.length,o=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(s<3?r(o):s>3?r(e,n,o):r(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o};const Ss=60;let ie=class extends Y{constructor(){super(...arguments),this.resizeObserver=void 0,this.transitionDuration="0.15s",this.transitionFunction="",this.history="",this.view="",this.setView=void 0,this.viewDirection="",this.historyState="",this.previousHeight="0px",this.mobileFullScreen=N.state.enableMobileFullScreen,this.onViewportResize=()=>{this.updateContainerHeight()}}updated(e){if(e.has("history")){const n=this.history;this.historyState!==""&&this.historyState!==n&&this.onViewChange(n)}e.has("transitionDuration")&&this.style.setProperty("--local-duration",this.transitionDuration),e.has("transitionFunction")&&this.style.setProperty("--local-transition",this.transitionFunction)}firstUpdated(){this.transitionFunction&&this.style.setProperty("--local-transition",this.transitionFunction),this.style.setProperty("--local-duration",this.transitionDuration),this.historyState=this.history,this.resizeObserver=new ResizeObserver(e=>{for(const n of e)if(n.target===this.getWrapper()){let i=n.contentRect.height;const s=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--apkt-footer-height")||"0");if(this.mobileFullScreen){const o=window.visualViewport?.height||window.innerHeight,r=this.getHeaderHeight();i=o-r-s,this.style.setProperty("--local-border-bottom-radius","0px")}else i=i+s,this.style.setProperty("--local-border-bottom-radius",s?"var(--apkt-borderRadius-5)":"0px");this.style.setProperty("--local-container-height",`${i}px`),this.previousHeight!=="0px"&&this.style.setProperty("--local-duration-height",this.transitionDuration),this.previousHeight=`${i}px`}}),this.resizeObserver.observe(this.getWrapper()),this.updateContainerHeight(),window.addEventListener("resize",this.onViewportResize),window.visualViewport?.addEventListener("resize",this.onViewportResize)}disconnectedCallback(){const e=this.getWrapper();e&&this.resizeObserver&&this.resizeObserver.unobserve(e),window.removeEventListener("resize",this.onViewportResize),window.visualViewport?.removeEventListener("resize",this.onViewportResize)}render(){return u`
      <div class="container" data-mobile-fullscreen="${ye(this.mobileFullScreen)}">
        <div
          class="page"
          data-mobile-fullscreen="${ye(this.mobileFullScreen)}"
          view-direction="${this.viewDirection}"
        >
          <div class="page-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `}onViewChange(e){const n=e.split(",").filter(Boolean),i=this.historyState.split(",").filter(Boolean),s=i.length,o=n.length,r=n[n.length-1]||"",a=St.cssDurationToNumber(this.transitionDuration);let d="";o>s?d="next":o<s?d="prev":o===s&&n[o-1]!==i[s-1]&&(d="next"),this.viewDirection=`${d}-${r}`,setTimeout(()=>{this.historyState=e,this.setView?.(r)},a),setTimeout(()=>{this.viewDirection=""},a*2)}getWrapper(){return this.shadowRoot?.querySelector("div.page")}updateContainerHeight(){const e=this.getWrapper();if(!e)return;const n=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--apkt-footer-height")||"0");let i=0;if(this.mobileFullScreen){const s=window.visualViewport?.height||window.innerHeight,o=this.getHeaderHeight();i=s-o-n,this.style.setProperty("--local-border-bottom-radius","0px")}else i=e.getBoundingClientRect().height+n,this.style.setProperty("--local-border-bottom-radius",n?"var(--apkt-borderRadius-5)":"0px");this.style.setProperty("--local-container-height",`${i}px`),this.previousHeight!=="0px"&&this.style.setProperty("--local-duration-height",this.transitionDuration),this.previousHeight=`${i}px`}getHeaderHeight(){return Ss}};ie.styles=[$s];fe([I({type:String})],ie.prototype,"transitionDuration",void 0);fe([I({type:String})],ie.prototype,"transitionFunction",void 0);fe([I({type:String})],ie.prototype,"history",void 0);fe([I({type:String})],ie.prototype,"view",void 0);fe([I({attribute:!1})],ie.prototype,"setView",void 0);fe([S()],ie.prototype,"viewDirection",void 0);fe([S()],ie.prototype,"historyState",void 0);fe([S()],ie.prototype,"previousHeight",void 0);fe([S()],ie.prototype,"mobileFullScreen",void 0);ie=fe([A("w3m-router-container")],ie);export{Dn as AppKitModal,B as W3mListWallet,Wn as W3mModal,ae as W3mModalBase,ie as W3mRouterContainer,jt as W3mUsageExceededView};
