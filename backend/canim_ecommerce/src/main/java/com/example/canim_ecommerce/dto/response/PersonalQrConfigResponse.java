package com.example.canim_ecommerce.dto.response;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PersonalQrConfigResponse {
    MomoQr momo;
    VnpayQr vnpay;
    String transferNoteHint;

    @Getter
    @Setter
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class MomoQr {
        boolean enabled;
        String accountName;
        String phone;
        String walletAccountNumber;
        String vietqrBankBin;
        boolean walletConfigured;
        String qrImagePath;
    }

    @Getter
    @Setter
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class VnpayQr {
        boolean enabled;
        String accountName;
        String bankName;
        String accountNumber;
        String qrImagePath;
    }
}
