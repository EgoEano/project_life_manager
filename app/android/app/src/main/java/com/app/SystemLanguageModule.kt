package com.app

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.Locale

class SystemLanguageModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "SystemLanguage"
    }

    override fun getConstants(): MutableMap<String, Any>? {
        val consts = HashMap<String, Any>()
        consts["languageCode"] = Locale.getDefault().language
        return consts
    }
}
