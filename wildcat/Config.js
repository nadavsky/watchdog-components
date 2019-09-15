/**
 * Created by milkana on 21/07/15.
 */


var configs = {
    "ios": {
        "env": {
            "Dev": {
                "app": "http://domain.zip"
            },
            "Dev_Real": {
                "app": "https://domain.ipa"
            },
            "Local": {
            }
        },
        "general": {
            "platformName": "iOS",
            "autoAcceptAlerts": true
        },
        "servers": {
            "Appium_IP": "http://192.168.10.30:4732",
            "connectedDevices": {
                "iPhone_5_ios_9": {
                    "deviceName": "=iPhone 5 (9.2)",
                    "platformVersion": "9.2",
                    "Appium_IP": "http://192.168.48.127:4723"
                },
                "iPad_Pro_ios_9": {
                    "deviceName": "iPad 2",
                    "platformVersion": "9.2",
                    "Appium_IP": "http://192.168.48.127:4723"
                },
                "iPhone_6_Plus_ios_9.2": {
                    "deviceName": "=iPhone 6s Plusss (9.2)",
                    "platformVersion": "9.0",
                    "Appium_IP": "http://192.168.48.127:4723"
                },
                "iPhone_6_Plus_ios_8.4": {
                    "deviceName": "=iPhone 6 Plus (8.4)",
                    "platformVersion": "8.4",
                    "Appium_IP": "http://192.168.10.121:4723"
                },
                "iPhone_5s_ios_7.1": {
                    "deviceName": "iPhone 5s",
                    "platformVersion": "7.1",
                    "Appium_IP": "http://192.168.10.121:4723"
                },
                "iPhone_6_ios_8.3": {
                    "deviceName": "iPhone 6",
                    "platformVersion": "8.3",
                    "Appium_IP": "http://192.168.10.121:4723"
                },
                "iPad_2_ios_8.3": {
                    "deviceName": "iPad 2",
                    "platformVersion": "8.3",
                    "Appium_IP": "http://192.168.10.121:4723"
                },
                "iPhone_5_ios_8.3": {
                    "deviceName": "iPhone 5",
                    "platformVersion": "8.3",
                    "Appium_IP": "http://192.168.10.121:4723"
                },
                "iPhone_6s_ios_9_local": {
                    "deviceName": "=iPhone 6 (9.2)",
                    "platformVersion": "9.2",
                    "Appium_IP": "http://localhost:4723"
                },
                "iPhone_ios_real": {
                    "deviceName": "=iPad Real (9.3)",
                    //"browserName": "Safari",
                    "platformVersion": "9.2",
                    "Appium_IP": "http://192.168.48.128:4723"
                },
                "iPhone_ios_real_small": {
                    "deviceName": "=ios (9.2)",
                    "platformVersion": "9.2",
                    "Appium_IP": "http://192.168.10.30:4723"
                },
                "chrome": {
                    "deviceName": "=iPhone 6 (9.2)",
                    "platformVersion": "9.2",
                    "Appium_IP": "http://localhost:4723"
                },
                "iPhone_6s_ios_9_local_eran": {
                    "deviceName": "=iPhone 6 (8.2 Simulator)",
                    "platformVersion": "8.2",
                    "Appium_IP": "http://127.0.0.1:4723"
                }
            },
            "appium": {
                "appium-version": "1.3.1"
            },
            "crossWalk": {}

        }
    },

    "Android": {
        "env": {
            "Dev": {
                "app": "https://domain.apk",
                "androidPackage": "com.package.dev"
            },
            "Local": {
                "app": "/path/to/apk.apk",
                "androidPackage": "com.package.dev"
            }
        },
        "general": {
            "appActivity": ".MainActivity",
            "appWaitActivity": ".MainActivity",
            "platformName": "Android",
            "newCommandTimeout": 60000,
            "no-reset": true
        },
        "servers": {
            //"Appium_IP": "http://192.168.10.99:4723",
            //"CrossWalk_IP": "http://192.168.10.99:9516",
            "connectedDevices": {
                "androidSamsung_Simulator6": {
                    "deviceName": "asd",
                    "platformVersion": "",
                    "Appium_IP": "http://192.168.48.126:4728"
                    //"CrossWalk_IP": "http://192.168.10.98:9520"
                },
                "androidSamsung_Simulator5": {
                    "deviceName": "asd",
                    "platformVersion": "",
                    "Appium_IP": "http://192.168.48.126:4729"
                    //"CrossWalk_IP": "http://192.168.10.98:9520"
                },
                "androidSamsung_Simulator7": {
                    "deviceName": "asd",
                    "platformVersion": "",
                    "Appium_IP": "http://192.168.48.126:4731"
                    //"CrossWalk_IP": "http://192.168.10.98:9520"
                },
                "androidSamsung_S4v5": {
                    "deviceName": "asd",
                    "platformVersion": "",
                    "Appium_IP": "http://192.168.48.126:4730"
                    //"CrossWalk_IP": "http://192.168.10.98:9520"
                },
                "androidSamsung_S4v4": {
                    "deviceName": "asd",
                    "platformVersion": "",
                    "Appium_IP": "http://192.168.48.126:4732",
                    "CrossWalk_IP": "http://192.168.48.126:9517"
                },
                "androidSamsung_S4v5p": {
                    "deviceName": "asd",
                    "platformVersion": "",
                    "Appium_IP": "http://192.168.48.126:4727",
                    "CrossWalk_IP": "http://192.168.48.126:9516"
                },
                "androidSamsung_S4": {
                    "deviceName": "nadav-23",
                    "platformVersion": "",
                    "Appium_IP": "http://0.0.0.0:4723"
                    //"CrossWalk_IP": "http://192.168.10.98:9520"
                },
                "androidmyPhone": {
                    "deviceName": "asd",
                    "Appium_IP": "http://127.0.0.1:4723",
                    "CrossWalk_IP": "http://127.0.0.1:9516"
                }
            },
            "appium": {
                "browserName": "Android",
                "appium-version": "1.4.8"
            },
            "crossWalk": {
                "browserName": "xwalk",
                "androidUseRunningApp": true
            }
        }
    },

    "chrome": {
        "env": {
            "Dev": {
                "url": "https://",
                "ip": "http://127.94.0.3:4444"},
            "Local": {
                "url": "https://",
                "ip": "http://127.0.0.1:9515"
            }

        },
        "general": {
            "generalProp" : "prop"
        }
    },

    "general": {
        "newCommandTimeout": 420,
        "autoWebview": true
    }
}


module.exports = configs;




