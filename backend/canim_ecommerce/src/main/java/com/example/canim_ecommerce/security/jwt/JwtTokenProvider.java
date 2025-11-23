package com.example.canim_ecommerce.security.jwt;

import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Component
@Data
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JwtTokenProvider {

    String secret;
    long accessTokenValidityMillis;
    long refreshTokenValidityMillis;

     public JwtTokenProvider(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.access-token-expiration-minutes}") long accessTokenMinutes,
            @Value("${security.jwt.refresh-token-expiration-days}") long refreshTokenDays) {

        this.secret = secret;
        this.accessTokenValidityMillis = accessTokenMinutes * 60 * 1000L;
        this.refreshTokenValidityMillis = refreshTokenDays * 24 * 60 * 60 * 1000L;

        if (secret == null || secret.getBytes().length < 32) {
            log.warn("JWT secret seems short — please use a longer, random secret for HS512");
        }
    }

    public String generateAccessToken(String subject, Collection<String> roles) {
        try {
            JWSSigner signer = new MACSigner(secret.getBytes());
            Date now = new Date();
            Date exp = new Date(now.getTime() + accessTokenValidityMillis);

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(subject)
                    .issueTime(now)
                    .expirationTime(exp)
                    .jwtID(UUID.randomUUID().toString())
                    .claim("type", "access")
                    .claim("roles", roles)
                    .build();

            SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS512), claimsSet);
            signedJWT.sign(signer);
            return signedJWT.serialize();
        } catch (Exception e) {
            log.error("generateAccessToken error", e);
            throw new RuntimeException("Error generating access token", e);
        }
    }

    public String generateRefreshToken(String subject) {
        try {
            JWSSigner signer = new MACSigner(secret.getBytes());
            Date now = new Date();
            Date exp = new Date(now.getTime() + refreshTokenValidityMillis);

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(subject)
                    .issueTime(now)
                    .expirationTime(exp) 
                    .jwtID(UUID.randomUUID().toString())
                    .claim("type", "refresh")
                    .build();

            SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS512), claimsSet);
            signedJWT.sign(signer);
            return signedJWT.serialize();
        } catch (Exception e) {
            log.error("generateRefreshToken error", e);
            throw new RuntimeException("Error generating refresh token", e);
        }
    }

    private SignedJWT parseSignedJwt(String token) throws Exception {
        return SignedJWT.parse(token);
    }

    public boolean validateToken(String token) {
        try {
            SignedJWT signedJWT = parseSignedJwt(token);
            JWSVerifier verifier = new MACVerifier(secret.getBytes());
            if (!signedJWT.verify(verifier)) return false;
            Date exp = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (exp == null) return false;
            return exp.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public boolean validateAccessToken(String token) {
        try {
            SignedJWT s = parseSignedJwt(token);
            var claims = s.getJWTClaimsSet();
            if (!"access".equals(claims.getStringClaim("type"))) return false;
            return validateToken(token);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean validateRefreshToken(String token) {
        try {
            SignedJWT s = parseSignedJwt(token);
            var claims = s.getJWTClaimsSet();
            if (!"refresh".equals(claims.getStringClaim("type"))) return false;
            Date exp = claims.getExpirationTime();
            if (exp == null) { 
                Date iat = claims.getIssueTime();
                if (iat == null) return false;
                long expiryMillis = iat.getTime() + refreshTokenValidityMillis;
                exp = new Date(expiryMillis);
            }
            return exp.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public String getSubject(String token) {
        try {
            return parseSignedJwt(token).getJWTClaimsSet().getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    public List<String> getRoles(String token) {
        try {
            Object claim = parseSignedJwt(token).getJWTClaimsSet().getClaim("roles");
            if (claim instanceof List<?>) return (List<String>) claim;
        } catch (Exception e) {
        }
        return Collections.emptyList();
    }

    public String getJti(String token) {
        try {
            return parseSignedJwt(token).getJWTClaimsSet().getJWTID();
        } catch (Exception e) {
            return null;
        }
    }

    public long getAccessTokenValidityMillis() {
        return accessTokenValidityMillis;
    }

    public long getRefreshTokenValidityMillis() {
        return refreshTokenValidityMillis;
    }

    public long getAccessTokenValiditySeconds() {
        return accessTokenValidityMillis / 1000L;
    }

    public long getRefreshTokenValiditySeconds() {
        return refreshTokenValidityMillis / 1000L;
    }
}
