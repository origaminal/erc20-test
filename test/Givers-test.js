
const { expect } = require("chai");
const { ethers } = require("hardhat");





  let GiversToken;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  
  describe("Givers Chain", function () {

  beforeEach(async function () {
    
    
    GiversToken =  await ethers.getContractFactory("GiversChain");

    [owner, addr1, addr2, addr3, addr4, ...addrs] = await ethers.getSigners();

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


  // You can nest describe calls to create subsections.
  describe("Deployment", function () {

    it("Should set the right supply amount",async function (){
        const totalSupply = ethers.utils.parseEther('1000000000')
        expect(await hardhatToken.totalSupply()).to.equal(ethers.utils.parseEther('100000000'))
    })

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });

  });

  describe("Transfers", function () {

    it("Should transfer with no fee for excluded accounts ", async function () {
      // Transfer 50 tokens from owner to addr1

      //await hardhatToken.excludeFromFee(owner.address)
      await hardhatToken.excludeFromFee(addr1.address)
      await hardhatToken.excludeFromFee(addr2.address)

      await hardhatToken.transfer(addr1.address, 50);
      const addr1Balance = await hardhatToken.balanceOf(
        addr1.address
      );
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await hardhatToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await hardhatToken.balanceOf(
        addr2.address
      );
      expect(addr2Balance).to.equal(50);

      //Treansfer back to owner  
      await hardhatToken.connect(addr2).transfer(owner.address, 50);
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);

    });

    it("Should transfer with fee for included accounts ", async function () {
      // Transfer 50 tokens from owner to addr3


      await hardhatToken.transfer(addr3.address, 50);
      const addr3Balance = await hardhatToken.balanceOf(
        addr3.address
      );
      expect(addr3Balance).to.equal(50);

      //Transfer 50 tokens from addr1 to addr2
      //We use .connect(signer) to send a transaction from another account
      await hardhatToken.connect(addr3).transfer(addr4.address, 50);
      const addr4Balance = await hardhatToken.balanceOf(
        addr4.address
      );
      expect(addr4Balance).to.equal(46);
    });

    //Fails, no fee transfer to Charity and Marketing 
    it('Should send fee fo Charity and marketing wallet', async function () {
    
      //get Charitywallet and MarketingWallet balance before transfer
      const charityWalletBefore = await hardhatToken.balanceOf(addr1.address)
      const MarketingWalletBefore = await hardhatToken.balanceOf(addr2.address)

      //Transfer from owner to  addr3 to addr4 (expect charges of 4%)
      await hardhatToken.transfer(addr3.address, 150)
      await hardhatToken.connect(addr3).transfer(addr4.address,100)

       //get Charitywallet and MarketingWallet balance after transfer
       const charityWalletAfter = await hardhatToken.balanceOf(addr1.address)
       const MarketingWalletAfter = await hardhatToken.balanceOf(addr2.address)
       
       const  marketingDiff= MarketingWalletAfter - MarketingWalletBefore
       const  charityDiff= charityWalletAfter - charityWalletBefore
      
      expect(marketingDiff).to.be.equal(3)
      expect(charityDiff).to.be.equal(1)

    })
   
  });


})
