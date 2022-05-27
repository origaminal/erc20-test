
const { expect } = require("chai");
const { ethers } = require("hardhat");




  let GiversToken;
  let owner;
  let addr1;
  let addr2;
  

  before(async function () {
    
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    this.provider = ethers.provider;


/**
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

