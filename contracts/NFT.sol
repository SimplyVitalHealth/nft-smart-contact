// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

//NFT contract used for Shyro NFT
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721Enumerable, Ownable {
  using Strings for uint256;
  using EnumerableSet for EnumerableSet.UintSet;
  EnumerableSet.UintSet private _starts;

  //range of nfts by ids 
  struct nftSet {
    uint start;
    uint end; 
    string baseURI;
  }
  mapping(uint => nftSet) public nftSets;

  string public baseExtension = ".json";
  uint256 public maxSupply = 1000;
  uint256 public maxMintAmount = 1;
  bool public paused = false;
  mapping(address => bool) public whitelisted;


  constructor(
    string memory _name,
    string memory _symbol,
    string memory _initBaseURI
  ) ERC721(_name, _symbol) {
    setBaseURI(0, maxSupply, _initBaseURI);
  }

  // internal
  function _baseURI(uint _start) internal view virtual returns (string memory) {

    string memory baseURI = "";

    uint length = _starts.length();
    if (length > 0) {
        for (uint i = 0; i < length; i++) {
           uint start = _starts.at(i);
           nftSet memory n = nftSets[start];
           if (_start >= n.start && _start <= n.end) {
             baseURI = n.baseURI;
             i = length;
           }
        }
    } 

    return baseURI;
  }
  
  function mint(address _to, uint256 _mintAmount) public payable {
    uint256 supply = totalSupply();
    require(_mintAmount > 0);
    require(supply + _mintAmount <= maxSupply);

    if (msg.sender != owner()) {
        require(!paused);
        require(whitelisted[msg.sender] == true);                        
        require(maxMintAmount >= balanceOf(msg.sender) + _mintAmount);        
    }

    for (uint256 i = 1; i <= _mintAmount; i++) {
      _safeMint(_to, supply + i);
    }
  }

  function walletOfOwner(address _owner)
    public
    view
    returns (uint256[] memory)
  {
    uint256 ownerTokenCount = balanceOf(_owner);
    uint256[] memory tokenIds = new uint256[](ownerTokenCount);
    for (uint256 i; i < ownerTokenCount; i++) {
      tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
    }
    return tokenIds;
  }

  function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory)
  {
    require(
      _exists(tokenId),
      "ERC721Metadata: URI query for nonexistent token"
    );

    string memory currentBaseURI = _baseURI(tokenId);
    return bytes(currentBaseURI).length > 0
        ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension))
        : "";
  }

  //only owner
  function pause(bool _state) public onlyOwner {
    paused = _state;
  }

  function whitelistUser(address _user) public onlyOwner {
    whitelisted[_user] = true;
  }

  function removeWhitelistUser(address _user) public onlyOwner {
    whitelisted[_user] = false;
  }

  function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
    maxMintAmount = _newmaxMintAmount;
  }

  function setmaxSupply(uint256 _newmaxSupply) public onlyOwner {
    maxSupply = _newmaxSupply;
  }

  function setBaseURI(uint256 _start,  uint256 _end, string memory _newBaseURI) public onlyOwner {
    _starts.add(_start); 
    nftSets[_start].start = _start;
    nftSets[_start].end = _end;    
    nftSets[_start].baseURI = _newBaseURI;
  }

  function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
    baseExtension = _newBaseExtension;
  }

  function withdraw() public payable onlyOwner {
    (bool os, ) = payable(owner()).call{value: address(this).balance}("");
    require(os);
  }
}