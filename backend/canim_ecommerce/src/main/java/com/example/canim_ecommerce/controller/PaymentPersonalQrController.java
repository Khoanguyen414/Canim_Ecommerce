package com.example.canim_ecommerce.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.canim_ecommerce.config.PersonalQrProperties;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.PersonalQrConfigResponse;
import com.example.canim_ecommerce.enums.ApiStatus;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/payments/personal-qr")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentPersonalQrController {

    PersonalQrProperties personalQrProperties;

  /** Cấu hình hiển thị QR cá nhân (public — không chứa secret). */
    @GetMapping("/config")
    public ApiResponse<PersonalQrConfigResponse> getConfig() {
        PersonalQrConfigResponse response = new PersonalQrConfigResponse();
        response.setTransferNoteHint("Nhap dung ma don hang (orderNo) vao noi dung chuyen khoan");

        PersonalQrConfigResponse.MomoQr momo = new PersonalQrConfigResponse.MomoQr();
        var momoCfg = personalQrProperties.getMomo();
        momo.setEnabled(momoCfg.isEnabled());
        momo.setAccountName(momoCfg.getAccountName());
        momo.setPhone(momoCfg.getPhone());
        momo.setWalletAccountNumber(momoCfg.getWalletAccountNumber());
        momo.setVietqrBankBin(momoCfg.getVietqrBankBin());
        momo.setWalletConfigured(
                momoCfg.getWalletAccountNumber() != null && !momoCfg.getWalletAccountNumber().isBlank());
        momo.setQrImagePath("/qr/momo-qr.png");
        response.setMomo(momo);

        PersonalQrConfigResponse.VnpayQr vnpay = new PersonalQrConfigResponse.VnpayQr();
        vnpay.setEnabled(personalQrProperties.getVnpay().isEnabled());
        vnpay.setAccountName(personalQrProperties.getVnpay().getAccountName());
        vnpay.setBankName(personalQrProperties.getVnpay().getBankName());
        vnpay.setAccountNumber(personalQrProperties.getVnpay().getAccountNumber());
        vnpay.setQrImagePath("/qr/vnpay-qr.png");
        response.setVnpay(vnpay);

        return ApiResponse.success(ApiStatus.SUCCESS, "OK", response);
    }
}
