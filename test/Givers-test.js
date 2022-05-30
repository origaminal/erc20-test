
const { reflect } = require("async");
const { expect } = require("chai");
const { ethers } = require("hardhat");





  let GiversToken;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let addr5;
  let addr6;
  let supply;
  
  
  describe("Givers Chain", function () {

  beforeEach(async function () {
    
    GiversToken =  await ethers.getContractFactory("GiversChain");

    [owner, addr1, addr2, addr3, addr4,addr5,addr6,...addrs] = await ethers.getSigners();

    hardhatToken = await GiversToken.deploy(addr1.address,addr2.address,process.env.ROUTER02);
    await hardhatToken.deployed()

/**
 *  this.provider = ethers.provider;
    GiversToken = new ethers.Contract('0xE5923960e3efd429Fe6d583d39566f1871Ad9ae5',
    ['function totalSupply() public view override returns (uint256)',
    'function balanceOf(address account) public view override returns (uint256)',
    'function transfer(address recipient, uint256 amount) public override returns (bool)'
     ]
    ,this.provider);
    
    // We can interact with the contract by calling `hardhatToken.method()`
    hardhatToken = GiversToken.connect(owner)
    
  });

  */
  })


  // // You can nest describe calls to create subsections.
  // describe("Deployment", function () {

  //   it("Should set the right supply amount",async function (){
  //       expect(await hardhatToken.totalSupply()).to.equal(ethers.utils.parseEther('100000000'))
  //   })

  //   it("Should assign the total supply of tokens to the owner", async function () {
  //     const ownerBalance = await hardhatToken.balanceOf(owner.address);
  //     expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  //   });

  // });



  describe("Transfers:Before swapAndLiquify is enabled", function () {

    it("Should transfer with no fee for excluded accounts ", async function () {
      // Transfer 50 tokens from owner to addr1

      //await hardhatToken.excludeFromFee(owner.address)
      await hardhatToken.excludeFromFee(addr1.address)
      await hardhatToken.excludeFromFee(addr2.address)
      const amount =ethers.utils.parseEther('50') 

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
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);

    });

    it("Should transfer with fee for included accounts ", async function () {

      //check rsupply && tsupply
      

      supply = await hardhatToken._getCurrentSupply()
      const {0: rsupply, 1: tsupply} = supply
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
   
  });

  // describe('Transfers:After swapAndLiquify is enabled', function(){

  //   it("Should transfer with no fee for excluded accounts ", async function () {
  //     // Transfer 5000000 tokens from owner to addr1
  //     await hardhatToken.excludeFromFee(addr1.address)
  //     await hardhatToken.excludeFromFee(addr2.address)

  //     await hardhatToken.transfer(addr1.address, 5000000);
  //     const addr1Balance = await hardhatToken.balanceOf(addr1.address);
  //     expect(addr1Balance).to.equal(5000000);

  //     // Transfer 5000000 tokens from addr1 to addr2
  //     // We use .connect(signer) to send a transaction from another account
  //     await hardhatToken.connect(addr1).transfer(addr2.address, 5000000);
  //     const addr2Balance = await hardhatToken.balanceOf(addr2.address);
  //     expect(addr2Balance).to.equal(5000000);

  //     //Treansfer back to owner  
  //     await hardhatToken.connect(addr2).transfer(owner.address, 5000000);
  //     const ownerBalance = await hardhatToken.balanceOf(owner.address);
  //     expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);

  //   });

  //   it("Should transfer with fee for included accounts ", async function () {
  //     // Transfer 5,000,000 tokens from owner to addr3


  //     await hardhatToken.transfer(addr3.address, 5000000);
  //     const addr3Balance = await hardhatToken.balanceOf(addr3.address);
  //     expect(addr3Balance).to.equal(5000000);

  //     //Transfer 5,000,000 tokens from addr3 to addr4
  //     //We use .connect(signer) to send a transaction from another account
  //     await hardhatToken.connect(addr3).transfer(addr4.address, 5000000);
  //     const addr4Balance = await hardhatToken.balanceOf(addr4.address);
  //     expect(addr4Balance).to.equal(4500000);
  //   });
 
  //   it('Should send fee fo Charity and marketing wallet', async function () {
    
  //     //get Charitywallet and MarketingWallet balance before transfer
  //     const charityWalletBefore = await hardhatToken.balanceOf(addr1.address)
  //     const MarketingWalletBefore = await hardhatToken.balanceOf(addr2.address)


  //       //Transfer from owner to  addr3 to addr4 (expect charges Marketing 3%, Charity 1%)
  //       await hardhatToken.transfer(addr3.address, 150)
  //       await hardhatToken.connect(addr3).transfer(addr4.address,100)
  


  //     //get Charitywallet and MarketingWallet balance after transfer
  //     const charityWalletAfter = await hardhatToken.balanceOf(addr1.address)
  //     const MarketingWalletAfter = await hardhatToken.balanceOf(addr2.address)
      
       
  //      const  marketingDiff= MarketingWalletAfter - MarketingWalletBefore
  //      const  charityDiff= charityWalletAfter - charityWalletBefore
      
  //     expect(MarketingWalletAfter).to.be.equal(3)
  //     expect(charityWalletAfter).to.be.equal(1)

  //   })
   
  // });

  })



