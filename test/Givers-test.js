

const { expect } = require("chai");
const { ethers } = require("hardhat");
const {assert} = require('chai')
const type = require('type-detect');





  let GiversToken;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let addr5;
  let addr6;
  let initialLiquidty;
  let supply;
  
  
  
  describe("Givers Chain", function () {

    beforeEach(async function () {
      
      GiversToken =  await ethers.getContractFactory("GiversChain");

      [owner, addr1, addr2, addr3, addr4,addr5,addr6,...addrs] = await ethers.getSigners();

      hardhatToken = await GiversToken.deploy(addr1.address,addr2.address,process.env.ROUTER02);
      await hardhatToken.deployed()

        
        this.provider = ethers.provider;

        //set Factory
        this.factory = new ethers.Contract(
          process.env.FACTORY,
          ['function getPair(address tokenA, address tokenB) external view returns (address pair)'],
          this.provider
        )
         this.factorysigner = this.factory.connect(owner)

         //set Pair
         //const pairAddress = await this.factorysigner.callStatic.createPair(process.env.giversEdited, process.env.WETH)
        this.pairAddress = hardhatToken.uniswapV2Pair()
         this.pair = new ethers.Contract(
           this.pairAddress,
           ['function totalSupply() external view returns (uint)','function balanceOf(address owner) external view returns (uint)','function approve(address spender, uint value) external returns (bool)','function decimals() external pure returns (uint8)','function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'],
           this.provider
         )
         this.pairsigner =this.pair.connect(owner)

         //set touter
         this.router02 = new ethers.Contract(
          process.env.ROUTER02,
          ['function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)', 'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)', 'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)', 'function swapExactTokensForETHSupportingFeeOnTransferTokens( uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external','function removeLiquidityETHSupportingFeeOnTransferTokens( address token,uint liquidity,uint amountTokenMin,uint amountETHMin,address to,uint deadline) external returns (uint amountETH)'], 
          this.provider);
         this.routersigner = this.router02.connect(owner)
         

         //add liquidty
         await hardhatToken.approve(process.env.ROUTER02, ethers.utils.parseEther("10000000"));
         initialLiquidty = ethers.utils.parseEther('10000000')
         const eTH = 5
         await this.routersigner.addLiquidityETH(
           hardhatToken.address,
           initialLiquidty,
           0,
           eTH,
           owner.address,
           Math.floor(Date.now() / 1000) + 60 * 10,
           {value : ethers.utils.parseEther("200")}
           )

            
            

    }) 
  /**
    describe("Deployment", function () {

        it("Should set the right supply amount",async function (){
            expect(await hardhatToken.totalSupply()).to.equal(ethers.utils.parseEther('1000000000'))
        })

        it("Should assign the total supply of tokens to the owner", async function () {
          const ownerBalance = await hardhatToken.balanceOf(owner.address)/10**18*10**9;
          //expect(await hardhatToken.totalSupply()/10**18*10**9).to.equal(ownerBalance + 1);
        });

      });

    describe("Transfers:Before swapAndLiquify is enabled", function () {

      it("Should transfer with no fee for excluded accounts ", async function () {
        // Transfer 50 tokens from owner to addr1

        //await hardhatToken.excludeFromFee(owner.address)
        await hardhatToken.excludeFromFee(addr1.address)
        await hardhatToken.excludeFromFee(addr2.address)
        const amount =ethers.utils.parseEther('50')
        const remoteLiquidity = ethers.utils.parseEther('30000000')

        await hardhatToken.transfer(addr1.address,amount );
        const addr1Balance = await hardhatToken.balanceOf(addr1.address);
        expect(addr1Balance).to.equal( amount);

        // Transfer 50 tokens from addr1 to addr2
        // We use .connect(signer) to send a transaction from another account
        await hardhatToken.connect(addr1).transfer(addr2.address, amount);
        const addr2Balance = await hardhatToken.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(amount);

        //Treansfer back to owner  
        await hardhatToken.connect(addr2).transfer(owner.address, amount);
        const ownerBalance = await hardhatToken.balanceOf(owner.address);
        //expect(await hardhatToken.totalSupply()/10**18).to.equal(9.9);

      });

      it("Should transfer with fee for included accounts ", async function () {

        //check reflection supply && true supply
        supply = await hardhatToken._getCurrentSupply()
        const {0: rsupply, 1: tsupply} = supply
        const rate = await hardhatToken._getRate()
        expect(rsupply > tsupply)
    

        // Transfer'50' tokens from owner to addr3 (expect balance of addr3 to be equal to'50')
        await hardhatToken.transfer(addr3.address, ethers.utils.parseEther('50'));
        const addr3Balance = await hardhatToken.balanceOf(addr3.address);
        expect(addr3Balance ).to.equal(ethers.utils.parseEther('50'));

        //Transfer'50' tokens from addr3 to addr4 (expect a fee of 10%)
        //We use .connect(signer) to send a transaction from another account
        await hardhatToken.connect(addr3).transfer(addr4.address, ethers.utils.parseEther('50'));
        const addr3Balance2 = await hardhatToken.balanceOf(addr3.address)
        const addr4Balance = await hardhatToken.balanceOf(addr4.address);
        const reflect = (addr4Balance - ethers.utils.parseEther('45'))/ethers.utils.parseEther('45')
        expect(0).to.be.equal(addr3Balance2)
        expect(true).to.be.equals(reflect > 0 && reflect < 2 )

        //Transfer 30 tokens from addr4 to addr5 (expect a fee of 10%)
        await hardhatToken.connect(addr4).transfer(addr5.address, ethers.utils.parseEther('30'));
        const addr4Balance2 = await hardhatToken.balanceOf(addr4.address);
        const addr5Balance = await hardhatToken.balanceOf(addr5.address);
        const reflection2 = (addr5Balance - ethers.utils.parseEther('27'))/ethers.utils.parseEther('27')

        expect(true).to.be.equal(ethers.utils.parseEther('15') < addr4Balance2 && addr4Balance2 < ethers.utils.parseEther('16'));
        expect(true).to.be.equal(reflection2 > 0 && reflection2 < 2)

        //Transfer 20 tokens from addr5 to addr6 (expect a fee of 10%)
        await hardhatToken.connect(addr5).transfer(addr6.address, ethers.utils.parseEther('20'));
        const addr5Balance2 = await hardhatToken.balanceOf(addr5.address);
        const addr6Balance = await hardhatToken.balanceOf(addr6.address);
        const reflection3 = (addr6Balance - ethers.utils.parseEther('27'))/ethers.utils.parseEther('27')

        expect(true).to.equal(ethers.utils.parseEther('7') < addr5Balance2 && addr5Balance2 < ethers.utils.parseEther('8'));
        expect(true).to.equal(0 > reflection3 && reflection3 < 3)
        
      });

      it('Should not send fee to Charity and marketing wallet', async function () {
      
        //get Charitywallet and MarketingWallet balance before transfer
        const charityWalletBefore = await hardhatToken.balanceOf(addr1.address)
        const MarketingWalletBefore = await hardhatToken.balanceOf(addr2.address)

        //Transfer from owner to  addr3 to addr4 (expect charges of 0%)
        await hardhatToken.transfer(addr3.address, 150)
        await hardhatToken.connect(addr3).transfer(addr4.address,100)

        //get Charitywallet and MarketingWallet balance after transfer
        const charityWalletAfter = await hardhatToken.balanceOf(addr1.address)
        const MarketingWalletAfter = await hardhatToken.balanceOf(addr2.address)
        
        const  marketingDiff= MarketingWalletAfter - MarketingWalletBefore
        const  charityDiff= charityWalletAfter - charityWalletBefore
        
        expect(marketingDiff).to.be.equal(0)
        expect(charityDiff).to.be.equal(0)

      })

      it('should send fee to burn wallent', async function () {

       const burnBalanceBefore = await hardhatToken.balanceOf('0x000000000000000000000000000000000000dEaD')

       // Transfer'200' tokens from owner to addr3 (expect balance of addr3 to be equal to'200')
       await hardhatToken.transfer(addr3.address, ethers.utils.parseEther('200'));
       const addr3Balance = await hardhatToken.balanceOf(addr3.address);
       expect(addr3Balance ).to.equal(ethers.utils.parseEther('200'));
       expect(burnBalanceBefore).to.be.equal(0)

       //Transfer'200' tokens from addr3 to addr4 (expect 1% (2) is sent to burn wallent)
       await hardhatToken.connect(addr3).transfer(addr4.address, ethers.utils.parseEther('200'));
       const burnBalanceAfter = await hardhatToken.balanceOf('0x000000000000000000000000000000000000dEaD')

       
       expect(true).to.be.equal(burnBalanceAfter > ethers.utils.parseEther('2') && burnBalanceAfter < ethers.utils.parseEther('3') )

        

      })
    
    });
    

    describe('Transfers:After swapAndLiquify is enabled', function(){

      it("Should transfer with no fee for excluded accounts ", async function () {
        // Transfer 50,000,000 tokens from owner to addr1

        //await hardhatToken.excludeFromFee(owner.address)
        await hardhatToken.excludeFromFee(addr1.address)
        await hardhatToken.excludeFromFee(addr2.address)
        const amount =ethers.utils.parseEther('50000000') 

        await hardhatToken.transfer(addr1.address,amount );
        const addr1Balance = await hardhatToken.balanceOf(addr1.address);
        expect(addr1Balance).to.equal( amount);

        // Transfer 50 tokens from addr1 to addr2
        // We use .connect(signer) to send a transaction from another account
        await hardhatToken.connect(addr1).transfer(addr2.address, amount);
        const addr2Balance = await hardhatToken.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(amount);

        //Treansfer back to owner  
        await hardhatToken.connect(addr2).transfer(owner.address, amount);
        const ownerBalance = await hardhatToken.balanceOf(owner.address);

        //expect balance to be equal  to totalsupply sub initialLiquidty
        expect(ethers.utils.parseEther('990000000')).to.equal(ownerBalance);

      });

      it("Should transfer with fee for included accounts ", async function () {

        //check reflection supply && true supply
        supply = await hardhatToken._getCurrentSupply()
        const {0: rsupply, 1: tsupply} = supply
        expect(rsupply > tsupply)

  

        // Transfer'50,000,000' tokens from owner to addr3 (expect balance of addr3 to be equal to'50,000,000')
        await hardhatToken.transfer(addr3.address, ethers.utils.parseEther('50000000'));
        const addr3Balance = await hardhatToken.balanceOf(addr3.address);
        expect(addr3Balance ).to.equal(ethers.utils.parseEther('50000000'));

        //Transfer'50,000,000' tokens from addr3 to addr4 (expect a fee of 10%)
        await hardhatToken.connect(addr3).transfer(addr4.address, ethers.utils.parseEther('50000000'));
        const addr3Balance2 = await hardhatToken.balanceOf(addr3.address)
        const addr4Balance = await hardhatToken.balanceOf(addr4.address);
        const reflect = (addr4Balance - ethers.utils.parseEther('45000000'))/ethers.utils.parseEther('5000000')

        expect(0).to.be.equal(addr3Balance2)
        expect(true).to.be.equals(reflect > 0 && reflect < 3 )
        expect(45).to.be.equal(Math.round(addr4Balance/10**24))


        //Transfer 30,000,000 tokens from addr4 to addr5 (expect a fee of 10%)
        await hardhatToken.connect(addr4).transfer(addr5.address, ethers.utils.parseEther('30000000'));
        const addr4Balance2 = await hardhatToken.balanceOf(addr4.address);
        const addr5Balance = await hardhatToken.balanceOf(addr5.address);
        const reflection2 = (addr5Balance - ethers.utils.parseEther('27000000'))/ethers.utils.parseEther('30000000')

        expect(true).to.be.equal(ethers.utils.parseEther('15000000') < addr4Balance2 && addr4Balance2 < ethers.utils.parseEther('16000000'));
        expect(true).to.be.equal(reflection2 > 0 && reflection2 < 3)
        expect(27).to.be.equal(Math.round(addr5Balance/10**24))

        //Transfer 20,000,000 tokens from addr5 to addr6 (expect a fee of 10%)
        await hardhatToken.connect(addr5).transfer(addr6.address, ethers.utils.parseEther('20000000'));
        const addr5Balance2 = await hardhatToken.balanceOf(addr5.address);
        const addr6Balance = await hardhatToken.balanceOf(addr6.address);
        const reflection3 = (addr6Balance - ethers.utils.parseEther('18000000'))/ethers.utils.parseEther('20000000')

        expect(true).to.equal(ethers.utils.parseEther('7000000') < addr5Balance2 && addr5Balance2 < ethers.utils.parseEther('8000000'));
        expect(true).to.equal(0 < reflection3 && reflection3 < 3)
        expect(18).to.be.equal(Math.round(addr6Balance/10**24))

      });

      it('Should send fee to Charity and marketing wallet', async function () {
      
        //get Charitywallet,MarketingWallet and this contract balances  before transfer
        const charityBalanceBefore = await this.provider.getBalance(addr1.address)
        const marketingBalanceBefore = await this.provider.getBalance(addr2.address)
        const tokenContractBalanceBefore = await this.provider.getBalance(hardhatToken.address)
        expect(true).to.be.equal(charityBalanceBefore < marketingBalanceBefore && tokenContractBalanceBefore < marketingBalanceBefore)
       

        // Transfer'50,000,000' tokens from owner to addr3 
        await hardhatToken.transfer(addr3.address, ethers.utils.parseEther('50000000')); 
        //Transfer'50,000,000' tokens from addr3 to addr4 (unlock swap and Liquidfy)
        await hardhatToken.connect(addr3).transfer(addr4.address, ethers.utils.parseEther('50000000'));
        //Transfer 30,000,000 tokens from addr4 to addr5 (trigger swap and Liquidfy)
        await hardhatToken.connect(addr4).transfer(addr5.address, ethers.utils.parseEther('30000000'));

      
         //get Charitywallet, MarketingWallet and Tokencontract balance after swap and liquidfy
         const charityBalanceAfter = await this.provider.getBalance(addr1.address)
         const marketingBalanceAfter = await this.provider.getBalance(addr2.address)
         const tokenContractBalanceAfter = await this.provider.getBalance(hardhatToken.address)
        
         const  marketingDiff= (marketingBalanceAfter - marketingBalanceBefore)/10**18
         const  charityDiff= (charityBalanceAfter - charityBalanceBefore)/10**18
         const tokenDiff= (tokenContractBalanceAfter - tokenContractBalanceBefore)/10**18
        
          expect(8).to.be.equal(Math.round(marketingDiff))
          expect(2).to.be.equal(Math.round(charityDiff))
          expect(0).to.be.equal(tokenDiff)

      });
    
    });
  */
    describe("Liquidity", function () {

      it("Should add right amount of liquidty", async function(){

            const Ownerliquidity = await this.pairsigner.balanceOf(owner.address)
            const totalLiquidity = await this.pairsigner.totalSupply()
            const decimals = await this.pairsigner.decimals()

            const reserves = await this.pairsigner.getReserves()
            const {0: reserve0, 1:reserve1, 3: blockTimestampLast} = reserves
            const ETH = reserve0/10**18
            const GIVERS = reserve1/10**18

            const MINIMUM_LIQUIDITY = 10**3;
            const lpTokenAmount = (Math.sqrt( ETH* GIVERS));


            expect(true).to.be.equal(ETH ===200|| ETH === 10000000)
            expect(true).to.be.equal(GIVERS === 10000000 || GIVERS ===200)
            expect(decimals).to.be.equal(18)

            expect(totalLiquidity/10**decimals).to.be.equal(Ownerliquidity/10**decimals)
            expect(lpTokenAmount).to.be.equals(Ownerliquidity/10**decimals)
      });

      it("Should remove half Liquidity", async function() {

          const GIVERS = 10000000;
          const ETH = 200;
          const lp = (Math.sqrt(GIVERS * ETH))*10**18;
          const half = (lp/2)
          var otherhalf = lp - half

          await this.pairsigner.approve(process.env.ROUTER02, BigInt(half));
          await this.routersigner.removeLiquidityETHSupportingFeeOnTransferTokens(
            hardhatToken.address,
            BigInt(half),
            0,
            0,
            owner.address,
            Math.floor(Date.now() / 1000) + 60 * 10,
            )

         var ownerBal = await this.pairsigner.balanceOf(owner.address);
         otherhalf = otherhalf/10**18
         ownerBal = ownerBal/10**18

          expect(ownerBal.toFixed(5)).to.be.equal(otherhalf.toFixed(5))

      });

    });

      describe("Total supply", function () {

          it("Should be equal to defined value", async function(){
              const totalSupply = await hardhatToken.totalSupply()

              expect(totalSupply).to.be.equal(ethers.utils.parseUnits('1000000000', 18))
          });

      });

      describe("Transfer", function () {

          it("Should not take fees from excluded accounts", async function(){
              // All initial supply belongs to owner
              expect(
                  true,
                  'Owner is not fee-free'
              ).to.be.equal(await hardhatToken.isExcludedFromFee(owner.address))

              const amount = ethers.utils.parseUnits('100', 18)
              const ownerInitialBalance = await hardhatToken.balanceOf(owner.address)

              // Transfer FROM fee-free address is fee-free
              await hardhatToken.transfer(addr1.address, amount)
              const addr1Balance = await hardhatToken.balanceOf(addr1.address)

              expect(amount, 'Transfer FROM fee-free acc is not fee-free').to.be.equal(addr1Balance)

              // Transfer TO fee-free address is fee-free
              await hardhatToken.excludeFromFee(addr2.address)
              await hardhatToken.connect(addr1).transfer(addr2.address, amount)
              const addr2Balance = await hardhatToken.balanceOf(addr2.address)

              expect(amount, 'Transfer TO fee-free acc is not fee-free').to.be.equal(addr2Balance)

              // Transfer FROM fee-free TO fee-free address is fee-free
              await hardhatToken.connect(addr2).transfer(owner.address, amount)
              const ownerBalance = await hardhatToken.balanceOf(owner.address)

              expect(
                  ownerInitialBalance,
                  'Transfer FROM and TO fee-free acc is not fee-free'
              ).to.be.equal(ownerBalance)
          });

          it("Should take fees from not excluded accounts", async function(){
              // All initial supply belongs to owner
              // Ensure addresses has fee applied
              await hardhatToken.includeInFee(owner.address)
              await hardhatToken.includeInFee(addr1.address)
              // Ensure tax fee exists
              await hardhatToken.setTaxFeePercent(1)
              const initialTotalFees = await hardhatToken.totalFees()

              const amount = ethers.utils.parseUnits('100', 18)

              // Transfer FROM fee-free address is fee-free
              await hardhatToken.transfer(addr1.address, amount)
              const addr1Balance = await hardhatToken.balanceOf(addr1.address)

              expect(
                  true,
                  'Transfer is fee-free'
              ).to.be.equal(
                  amount.gt(addr1Balance)
              )

              const totalFees = await hardhatToken.totalFees()
              expect(
                  true,
                  'No tax fees collected'
              ).to.be.equal(
                  initialTotalFees.lt(totalFees)
              )
          });

      });

      describe("Pair Liquidity", function () {

          it("Should add liquidity after during transfer", async function(){
              const amount = ethers.utils.parseUnits('100', 18)
              const amountToSwapForLiquidity = ethers.utils.parseUnits('10000000', 18)

              const initialPairSupply = await this.pair.totalSupply()
              await hardhatToken.setSwapAndLiquifyEnabled(true)
              // set the contract balance enough to add liquidity
              await hardhatToken.transfer(hardhatToken.address, amountToSwapForLiquidity)
              await hardhatToken.transfer(addr1.address, amount)

              const pairSupply = await this.pair.totalSupply()

              expect(
                  true,
                  'Liquidity was not increased'
              ).to.be.equal(
                  pairSupply.gt(initialPairSupply)
              )
          });

      });

      describe("Fees", function () {

          it("Should take tax fee when enabled", async function(){
              const amount = ethers.utils.parseUnits('100', 18)

              // Ensure tax fee
              await hardhatToken.setTaxFeePercent(3)
              const initialTotalFees = await hardhatToken.totalFees()

              await hardhatToken.excludeFromFee(owner.address)
              // Initiate transfer without fee
              await hardhatToken.transfer(addr1.address, amount)
              const totalFees1 = await hardhatToken.totalFees()

              expect(
                  true,
                  'Tax fee has been taken'
              ).to.be.equal(
                  totalFees1.eq(initialTotalFees)
              )

              await hardhatToken.includeInFee(owner.address)
              // Initiate transfer with fee
              await hardhatToken.transfer(addr1.address, amount)
              const totalFees2 = await hardhatToken.totalFees()

              expect(
                  true,
                  'Tax fee has not been taken'
              ).to.be.equal(
                  totalFees2.gt(totalFees1)
              )

              await hardhatToken.setTaxFeePercent(0)
              // Initiate transfer without fee
              await hardhatToken.transfer(addr1.address, amount)
              const totalFees3 = await hardhatToken.totalFees()

              expect(
                  true,
                  'Tax fee has been taken'
              ).to.be.equal(
                  totalFees3.eq(totalFees2)
              )
          });

          it("Should take burn fee when enabled", async function(){
              const amount = ethers.utils.parseUnits('100', 18)

              // Ensure burn fee
              await hardhatToken.setBurnFeePercent(3)
              // Ensure balance of burn address is strict
              await hardhatToken.excludeFromReward('0x000000000000000000000000000000000000dEaD')

              const initialBurnBalance = await hardhatToken.balanceOf('0x000000000000000000000000000000000000dEaD')

              await hardhatToken.excludeFromFee(owner.address)
              await hardhatToken.transfer(addr1.address, amount)
              // Initiate transfer without fee
              const burnBalance1 = await hardhatToken.balanceOf('0x000000000000000000000000000000000000dEaD')

              expect(
                  true,
                  'Burn fee has been taken'
              ).to.be.equal(
                  burnBalance1.eq(initialBurnBalance)
              )

              await hardhatToken.includeInFee(owner.address)
              // Initiate transfer with fee
              await hardhatToken.transfer(addr1.address, amount)
              const burnBalance2 = await hardhatToken.balanceOf('0x000000000000000000000000000000000000dEaD')

              expect(
                  true,
                  'Burn fee has not been taken'
              ).to.be.equal(
                  burnBalance2.gt(burnBalance1)
              )

              await hardhatToken.setBurnFeePercent(0)
              // Initiate transfer without fee
              await hardhatToken.transfer(addr1.address, amount)
              const burnBalance3 = await hardhatToken.balanceOf('0x000000000000000000000000000000000000dEaD')

              console.log(burnBalance2, burnBalance3)

              expect(
                  true,
                  'Burn fee has been taken'
              ).to.be.equal(
                  burnBalance3.eq(burnBalance2)
              )
          });

          it("Should take liquidity fee when enabled", async function(){
              const amount = ethers.utils.parseUnits('100', 18)

              // Ensure balance of address is strict
              await hardhatToken.excludeFromReward(hardhatToken.address)

              // Ensure liquidity fees
              await hardhatToken.setLiquidityFeePercent(3)
              await hardhatToken.setMarketingFeePercent(3)
              await hardhatToken.setCharityFeePercent(3)

              const initialLiquidityBalance = await hardhatToken.balanceOf(hardhatToken.address)
              const initialMarketingBalance = await hardhatToken.balanceOf(hardhatToken.address)
              const initialCharityBalance = await hardhatToken.balanceOf(hardhatToken.address)

              await hardhatToken.excludeFromFee(owner.address)
              await hardhatToken.transfer(addr1.address, amount)
              // Initiate transfer without fee
              const liquidityBalance1 = await hardhatToken.balanceOf(hardhatToken.address)

              expect(
                  true,
                  'Liquidity fee has been taken'
              ).to.be.equal(
                  liquidityBalance1.eq(initialLiquidityBalance)
              )

              await hardhatToken.includeInFee(owner.address)
              // Initiate transfer with fee
              await hardhatToken.transfer(addr1.address, amount)
              const liquidityBalance2 = await hardhatToken.balanceOf(hardhatToken.address)

              expect(
                  true,
                  'Liquidity fee has not been taken'
              ).to.be.equal(
                  liquidityBalance2.gt(liquidityBalance1)
              )

              await hardhatToken.setLiquidityFeePercent(3)
              await hardhatToken.setMarketingFeePercent(0)
              await hardhatToken.setCharityFeePercent(0)
              // Initiate transfer with fee
              await hardhatToken.transfer(addr1.address, amount)
              const liquidityBalance3 = await hardhatToken.balanceOf(hardhatToken.address)

              expect(
                  true,
                  'Liquidity fee has not been taken'
              ).to.be.equal(
                  liquidityBalance3.gt(liquidityBalance2)
              )

              await hardhatToken.setLiquidityFeePercent(0)
              await hardhatToken.setMarketingFeePercent(3)
              await hardhatToken.setCharityFeePercent(0)
              // Initiate transfer with fee
              await hardhatToken.transfer(addr1.address, amount)
              const liquidityBalance4 = await hardhatToken.balanceOf(hardhatToken.address)

              expect(
                  true,
                  'Liquidity fee has not been taken'
              ).to.be.equal(
                  liquidityBalance4.gt(liquidityBalance3)
              )

              await hardhatToken.setLiquidityFeePercent(0)
              await hardhatToken.setMarketingFeePercent(0)
              await hardhatToken.setCharityFeePercent(3)
              // Initiate transfer with fee
              await hardhatToken.transfer(addr1.address, amount)
              const liquidityBalance5 = await hardhatToken.balanceOf(hardhatToken.address)

              expect(
                  true,
                  'Liquidity fee has not been taken'
              ).to.be.equal(
                  liquidityBalance5.gt(liquidityBalance4)
              )

              await hardhatToken.setLiquidityFeePercent(0)
              await hardhatToken.setMarketingFeePercent(0)
              await hardhatToken.setCharityFeePercent(0)
              // Initiate transfer without fee
              await hardhatToken.transfer(addr1.address, amount)
              const liquidityBalance6 = await hardhatToken.balanceOf(hardhatToken.address)

              // !!! SHOULD NOT be the case, bug in the code of Givers
              expect(
                  false,
                  'Liquidity fee has been taken'
              ).to.be.equal(
                  liquidityBalance6.eq(liquidityBalance5)
              )
          });


          it("Should send ETH to wallets on swap during transfer", async function(){
              const amount = ethers.utils.parseUnits('100', 18)
              const amountToSwapForLiquidity = ethers.utils.parseUnits('10000000', 18)

              const charityWalletAddress = addr1.address
              const marketingWalletAddress = addr2.address

              await hardhatToken.excludeFromReward(charityWalletAddress)
              await hardhatToken.excludeFromReward(marketingWalletAddress)

              const initialCharityWalletBalance = await this.provider.getBalance(charityWalletAddress)
              const initialMarketingWalletBalance = await this.provider.getBalance(marketingWalletAddress)

              await hardhatToken.setCharityFeePercent(3)
              await hardhatToken.setMarketingFeePercent(3)

              await hardhatToken.setSwapAndLiquifyEnabled(true)
              // set the contract balance enough to add liquidity
              await hardhatToken.transfer(hardhatToken.address, amountToSwapForLiquidity)
              await hardhatToken.transfer(addr3.address, amount)

              const charityWalletBalance1 = await this.provider.getBalance(charityWalletAddress)
              const marketingWalletBalance1 = await this.provider.getBalance(marketingWalletAddress)

              expect(
                  true,
                  'Wallet balances not increased'
              ).to.be.equal(
                  charityWalletBalance1.gt(initialCharityWalletBalance)
                  && marketingWalletBalance1.gt(initialMarketingWalletBalance)
              )

              await hardhatToken.setCharityFeePercent(3)
              await hardhatToken.setMarketingFeePercent(0)

              await hardhatToken.transfer(addr3.address, amount)

              const charityWalletBalance2 = await this.provider.getBalance(charityWalletAddress)
              const marketingWalletBalance2 = await this.provider.getBalance(marketingWalletAddress)

              // !!! FALSE due to a but in Givers
              expect(
                  false,
                  'Wallet balances not increased'
              ).to.be.equal(
                  charityWalletBalance2.gt(charityWalletBalance1)
                  && marketingWalletBalance2.eq(marketingWalletBalance1)
              )

              await hardhatToken.setCharityFeePercent(0)
              await hardhatToken.setMarketingFeePercent(3)

              await hardhatToken.transfer(addr3.address, amount)

              const charityWalletBalance3 = await this.provider.getBalance(charityWalletAddress)
              const marketingWalletBalance3 = await this.provider.getBalance(marketingWalletAddress)

              expect(
                  true,
                  'Wallet balances not increased'
              ).to.be.equal(
                  charityWalletBalance3.eq(charityWalletBalance2)
                  && marketingWalletBalance3.gt(marketingWalletBalance2)
              )
          });

      });

  })
