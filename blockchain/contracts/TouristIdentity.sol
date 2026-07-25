// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SafeYatra Tourist Identity Registry
/// @notice Stores only cryptographic identity hashes — no personal data on-chain
contract TouristIdentity {
    struct Identity {
        string  touristId;
        bytes32 identityHash;   // SHA-256 of (name:phone:destination:timestamp)
        bool    verified;
        uint256 timestamp;
        address registeredBy;
    }

    mapping(string => Identity) private identities;   // touristId → Identity
    mapping(address => bool)    public  authorizedVerifiers;
    address public owner;

    event IdentityRegistered(string indexed touristId, bytes32 identityHash, uint256 timestamp);
    event IdentityVerified(string indexed touristId, address verifier, uint256 timestamp);
    event VerifierAdded(address verifier);
    event VerifierRemoved(address verifier);

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
    modifier onlyVerifier() { require(authorizedVerifiers[msg.sender] || msg.sender == owner, "Not authorized"); _; }

    constructor() { owner = msg.sender; authorizedVerifiers[msg.sender] = true; }

    /// @notice Register a tourist identity hash on-chain
    function registerIdentity(string calldata touristId, bytes32 identityHash) external onlyVerifier {
        require(bytes(touristId).length > 0, "Empty touristId");
        require(identities[touristId].timestamp == 0, "Already registered");
        identities[touristId] = Identity({
            touristId:    touristId,
            identityHash: identityHash,
            verified:     false,
            timestamp:    block.timestamp,
            registeredBy: msg.sender
        });
        emit IdentityRegistered(touristId, identityHash, block.timestamp);
    }

    /// @notice Verify a tourist identity by comparing hash
    function verifyIdentity(string calldata touristId, bytes32 hashToVerify) external onlyVerifier returns (bool) {
        Identity storage id = identities[touristId];
        require(id.timestamp > 0, "Identity not found");
        bool match_ = id.identityHash == hashToVerify;
        if (match_) {
            id.verified = true;
            emit IdentityVerified(touristId, msg.sender, block.timestamp);
        }
        return match_;
    }

    /// @notice Get identity record (hash only — no PII)
    function getIdentity(string calldata touristId) external view returns (
        bytes32 identityHash, bool verified, uint256 timestamp
    ) {
        Identity storage id = identities[touristId];
        require(id.timestamp > 0, "Identity not found");
        return (id.identityHash, id.verified, id.timestamp);
    }

    function addVerifier(address v) external onlyOwner { authorizedVerifiers[v] = true; emit VerifierAdded(v); }
    function removeVerifier(address v) external onlyOwner { authorizedVerifiers[v] = false; emit VerifierRemoved(v); }
}
