package com.example.canim_ecommerce.util;

import java.math.BigDecimal;

public final class MapUrlUtils {
    private MapUrlUtils() {
    }

    public static String buildGoogleMapsUrl(BigDecimal latitude, BigDecimal longitude) {
        if (latitude == null || longitude == null) {
            return null;
        }
        return "https://www.google.com/maps?q=" + latitude.stripTrailingZeros().toPlainString()
                + "," + longitude.stripTrailingZeros().toPlainString();
    }
}
