//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Certificate
 * @dev A contract for issuing non-transferable (soulbound) educational certificates as tokens
 * @author Scaffold-ETH 2
 */
contract Certificate is Ownable {

    uint256 private _tokenIds;

    // Certificate data structure
    struct CertificateData {
        string studentName;
        string universityName;
        uint256 yearOfGraduation;
        string degree;
        string major;
        string[] skills;
        string documentURI;  // IPFS URI of the PDF certificate
        bool isApproved;     // Student's approval status
        bool isRevoked;      // Revocation status
    }

    // Mapping from token ID to certificate data
    mapping(uint256 => CertificateData) private _certificates;
    
    // Mapping from address to token IDs
    mapping(address => uint256[]) private _studentCertificates;
    
    // Events
    event CertificateIssued(uint256 indexed tokenId, address indexed student, string universityName);
    event CertificateApproved(uint256 indexed tokenId, address indexed student);
    event CertificateRevoked(uint256 indexed tokenId);
    event CertificateUpdated(uint256 indexed tokenId);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Issues a new certificate to a student
     * @param student The address of the student
     * @param studentName The name of the student
     * @param universityName The name of the issuing university
     * @param yearOfGraduation The year of graduation
     * @param degree The degree obtained
     * @param major The major subject
     * @param skills Array of skills acquired
     * @param documentURI The IPFS URI of the certificate document
     * @return The ID of the newly issued certificate
     */
    function issueCertificate(
        address student,
        string memory studentName,
        string memory universityName,
        uint256 yearOfGraduation,
        string memory degree,
        string memory major,
        string[] memory skills,
        string memory documentURI
    ) public onlyOwner returns (uint256) {
        _tokenIds += 1;
        uint256 newTokenId = _tokenIds;

        _certificates[newTokenId] = CertificateData({
            studentName: studentName,
            universityName: universityName,
            yearOfGraduation: yearOfGraduation,
            degree: degree,
            major: major,
            skills: skills,
            documentURI: documentURI,
            isApproved: false,
            isRevoked: false
        });

        _studentCertificates[student].push(newTokenId);

        emit CertificateIssued(newTokenId, student, universityName);
        return newTokenId;
    }

    /**
     * @dev Allows a student to approve their certificate
     * @param tokenId The ID of the certificate to approve
     */
    function approveCertificate(uint256 tokenId) public {
        require(_ownsToken(msg.sender, tokenId), "You don't own this certificate");
        require(!_certificates[tokenId].isApproved, "Certificate already approved");
        require(!_certificates[tokenId].isRevoked, "Certificate is revoked");

        _certificates[tokenId].isApproved = true;
        emit CertificateApproved(tokenId, msg.sender);
    }

    /**
     * @dev Allows the contract owner to revoke a certificate
     * @param tokenId The ID of the certificate to revoke
     */
    function revokeCertificate(uint256 tokenId) public onlyOwner {
        require(_certificates[tokenId].isApproved, "Certificate not approved");
        require(!_certificates[tokenId].isRevoked, "Certificate already revoked");

        _certificates[tokenId].isRevoked = true;
        emit CertificateRevoked(tokenId);
    }

    /**
     * @dev Updates the certificate data
     * @param tokenId The ID of the certificate to update
     * @param studentName The updated name of the student
     * @param universityName The updated name of the issuing university
     * @param yearOfGraduation The updated year of graduation
     * @param degree The updated degree obtained
     * @param major The updated major subject
     * @param skills The updated array of skills acquired
     * @param documentURI The updated IPFS URI of the certificate document
     */
    function updateCertificate(
        uint256 tokenId,
        string memory studentName,
        string memory universityName,
        uint256 yearOfGraduation,
        string memory degree,
        string memory major,
        string[] memory skills,
        string memory documentURI
    ) public onlyOwner {
        require(!_certificates[tokenId].isRevoked, "Certificate is revoked");
        
        // Only allow updates if not approved or owner is updating
        if (_certificates[tokenId].isApproved) {
            // If certificate is already approved, we can only update certain fields
            CertificateData storage cert = _certificates[tokenId];
            cert.documentURI = documentURI;
        } else {
            // If not approved, we can update everything
            _certificates[tokenId] = CertificateData({
                studentName: studentName,
                universityName: universityName,
                yearOfGraduation: yearOfGraduation,
                degree: degree,
                major: major,
                skills: skills,
                documentURI: documentURI,
                isApproved: false,
                isRevoked: false
            });
        }
        
        emit CertificateUpdated(tokenId);
    }

    /*
     * @dev Retrieves the certificate data for a given token ID
     * @param tokenId The ID of the certificate to retrieve
     * @return The certificate data
     */
    function getCertificate(uint256 tokenId) public view returns (
        string memory studentName,
        string memory universityName,
        uint256 yearOfGraduation,
        string memory degree,
        string memory major,
        string[] memory skills,
        string memory documentURI,
        bool isApproved,
        bool isRevoked
    ) {
        CertificateData memory cert = _certificates[tokenId];
        return (
            cert.studentName,
            cert.universityName,
            cert.yearOfGraduation,
            cert.degree,
            cert.major,
            cert.skills,
            cert.documentURI,
            cert.isApproved,
            cert.isRevoked
        );
    }

    /**
     * @dev Gets all certificates owned by a student
     * @param student The address of the student
     * @return An array of token IDs
     */
    function getCertificatesByStudent(address student) public view returns (uint256[] memory) {
        return _studentCertificates[student];
    }

    /**
     * @dev Gets the total number of certificates issued
     * @return The total number of certificates
     */
    function getTotalCertificates() public view returns (uint256) {
    return _tokenIds;
    }

    /**
     * @dev Checks if a student owns a specific certificate
     * @param student The address of the student
     * @param tokenId The ID of the certificate
     * @return True if the student owns the certificate, false otherwise
     */
    function _ownsToken(address student, uint256 tokenId) internal view returns (bool) {
        uint256[] memory tokens = _studentCertificates[student];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                return true;
            }
        }
        return false;
    }
}