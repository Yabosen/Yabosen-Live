; ModuleID = 'marshal_methods.x86.ll'
source_filename = "marshal_methods.x86.ll"
target datalayout = "e-m:e-p:32:32-p270:32:32-p271:32:32-p272:64:64-f64:32:64-f80:32-n8:16:32-S128"
target triple = "i686-unknown-linux-android21"

%struct.MarshalMethodName = type {
	i64, ; uint64_t id
	ptr ; char* name
}

%struct.MarshalMethodsManagedClass = type {
	i32, ; uint32_t token
	ptr ; MonoClass klass
}

@assembly_image_cache = dso_local local_unnamed_addr global [114 x ptr] zeroinitializer, align 4

; Each entry maps hash of an assembly name to an index into the `assembly_image_cache` array
@assembly_image_cache_hashes = dso_local local_unnamed_addr constant [228 x i32] [
	i32 42639949, ; 0: System.Threading.Thread => 0x28aa24d => 106
	i32 67008169, ; 1: zh-Hant\Microsoft.Maui.Controls.resources => 0x3fe76a9 => 33
	i32 72070932, ; 2: Microsoft.Maui.Graphics.dll => 0x44bb714 => 47
	i32 117431740, ; 3: System.Runtime.InteropServices => 0x6ffddbc => 99
	i32 165246403, ; 4: Xamarin.AndroidX.Collection.dll => 0x9d975c3 => 52
	i32 182336117, ; 5: Xamarin.AndroidX.SwipeRefreshLayout.dll => 0xade3a75 => 71
	i32 195452805, ; 6: vi/Microsoft.Maui.Controls.resources.dll => 0xba65f85 => 30
	i32 199333315, ; 7: zh-HK/Microsoft.Maui.Controls.resources.dll => 0xbe195c3 => 31
	i32 205061960, ; 8: System.ComponentModel => 0xc38ff48 => 83
	i32 280992041, ; 9: cs/Microsoft.Maui.Controls.resources.dll => 0x10bf9929 => 2
	i32 317674968, ; 10: vi\Microsoft.Maui.Controls.resources => 0x12ef55d8 => 30
	i32 318968648, ; 11: Xamarin.AndroidX.Activity.dll => 0x13031348 => 48
	i32 336156722, ; 12: ja/Microsoft.Maui.Controls.resources.dll => 0x14095832 => 15
	i32 342366114, ; 13: Xamarin.AndroidX.Lifecycle.Common => 0x146817a2 => 59
	i32 356389973, ; 14: it/Microsoft.Maui.Controls.resources.dll => 0x153e1455 => 14
	i32 379916513, ; 15: System.Threading.Thread.dll => 0x16a510e1 => 106
	i32 385762202, ; 16: System.Memory.dll => 0x16fe439a => 90
	i32 395744057, ; 17: _Microsoft.Android.Resource.Designer => 0x17969339 => 34
	i32 435591531, ; 18: sv/Microsoft.Maui.Controls.resources.dll => 0x19f6996b => 26
	i32 442565967, ; 19: System.Collections => 0x1a61054f => 80
	i32 450948140, ; 20: Xamarin.AndroidX.Fragment.dll => 0x1ae0ec2c => 58
	i32 469710990, ; 21: System.dll => 0x1bff388e => 109
	i32 498788369, ; 22: System.ObjectModel => 0x1dbae811 => 96
	i32 500358224, ; 23: id/Microsoft.Maui.Controls.resources.dll => 0x1dd2dc50 => 13
	i32 503918385, ; 24: fi/Microsoft.Maui.Controls.resources.dll => 0x1e092f31 => 7
	i32 513247710, ; 25: Microsoft.Extensions.Primitives.dll => 0x1e9789de => 42
	i32 539058512, ; 26: Microsoft.Extensions.Logging => 0x20216150 => 39
	i32 592146354, ; 27: pt-BR/Microsoft.Maui.Controls.resources.dll => 0x234b6fb2 => 21
	i32 627609679, ; 28: Xamarin.AndroidX.CustomView => 0x2568904f => 56
	i32 627931235, ; 29: nl\Microsoft.Maui.Controls.resources => 0x256d7863 => 19
	i32 662205335, ; 30: System.Text.Encodings.Web.dll => 0x27787397 => 103
	i32 672442732, ; 31: System.Collections.Concurrent => 0x2814a96c => 78
	i32 688181140, ; 32: ca/Microsoft.Maui.Controls.resources.dll => 0x2904cf94 => 1
	i32 706645707, ; 33: ko/Microsoft.Maui.Controls.resources.dll => 0x2a1e8ecb => 16
	i32 709557578, ; 34: de/Microsoft.Maui.Controls.resources.dll => 0x2a4afd4a => 4
	i32 722857257, ; 35: System.Runtime.Loader.dll => 0x2b15ed29 => 100
	i32 759454413, ; 36: System.Net.Requests => 0x2d445acd => 94
	i32 775507847, ; 37: System.IO.Compression => 0x2e394f87 => 87
	i32 777317022, ; 38: sk\Microsoft.Maui.Controls.resources => 0x2e54ea9e => 25
	i32 789151979, ; 39: Microsoft.Extensions.Options => 0x2f0980eb => 41
	i32 823281589, ; 40: System.Private.Uri.dll => 0x311247b5 => 97
	i32 830298997, ; 41: System.IO.Compression.Brotli => 0x317d5b75 => 86
	i32 878954865, ; 42: System.Net.Http.Json => 0x3463c971 => 91
	i32 904024072, ; 43: System.ComponentModel.Primitives.dll => 0x35e25008 => 81
	i32 926902833, ; 44: tr/Microsoft.Maui.Controls.resources.dll => 0x373f6a31 => 28
	i32 967690846, ; 45: Xamarin.AndroidX.Lifecycle.Common.dll => 0x39adca5e => 59
	i32 992768348, ; 46: System.Collections.dll => 0x3b2c715c => 80
	i32 1012816738, ; 47: Xamarin.AndroidX.SavedState.dll => 0x3c5e5b62 => 69
	i32 1028951442, ; 48: Microsoft.Extensions.DependencyInjection.Abstractions => 0x3d548d92 => 38
	i32 1029334545, ; 49: da/Microsoft.Maui.Controls.resources.dll => 0x3d5a6611 => 3
	i32 1035644815, ; 50: Xamarin.AndroidX.AppCompat => 0x3dbaaf8f => 49
	i32 1044663988, ; 51: System.Linq.Expressions.dll => 0x3e444eb4 => 88
	i32 1052210849, ; 52: Xamarin.AndroidX.Lifecycle.ViewModel.dll => 0x3eb776a1 => 61
	i32 1082857460, ; 53: System.ComponentModel.TypeConverter => 0x408b17f4 => 82
	i32 1084122840, ; 54: Xamarin.Kotlin.StdLib => 0x409e66d8 => 75
	i32 1098259244, ; 55: System => 0x41761b2c => 109
	i32 1118262833, ; 56: ko\Microsoft.Maui.Controls.resources => 0x42a75631 => 16
	i32 1168523401, ; 57: pt\Microsoft.Maui.Controls.resources => 0x45a64089 => 22
	i32 1178241025, ; 58: Xamarin.AndroidX.Navigation.Runtime.dll => 0x463a8801 => 66
	i32 1203215381, ; 59: pl/Microsoft.Maui.Controls.resources.dll => 0x47b79c15 => 20
	i32 1234928153, ; 60: nb/Microsoft.Maui.Controls.resources.dll => 0x499b8219 => 18
	i32 1260983243, ; 61: cs\Microsoft.Maui.Controls.resources => 0x4b2913cb => 2
	i32 1293217323, ; 62: Xamarin.AndroidX.DrawerLayout.dll => 0x4d14ee2b => 57
	i32 1307337556, ; 63: YabosenStatus => 0x4dec6354 => 77
	i32 1324164729, ; 64: System.Linq => 0x4eed2679 => 89
	i32 1373134921, ; 65: zh-Hans\Microsoft.Maui.Controls.resources => 0x51d86049 => 32
	i32 1376866003, ; 66: Xamarin.AndroidX.SavedState => 0x52114ed3 => 69
	i32 1406073936, ; 67: Xamarin.AndroidX.CoordinatorLayout => 0x53cefc50 => 53
	i32 1430672901, ; 68: ar\Microsoft.Maui.Controls.resources => 0x55465605 => 0
	i32 1461004990, ; 69: es\Microsoft.Maui.Controls.resources => 0x57152abe => 6
	i32 1462112819, ; 70: System.IO.Compression.dll => 0x57261233 => 87
	i32 1469204771, ; 71: Xamarin.AndroidX.AppCompat.AppCompatResources => 0x57924923 => 50
	i32 1470490898, ; 72: Microsoft.Extensions.Primitives => 0x57a5e912 => 42
	i32 1480492111, ; 73: System.IO.Compression.Brotli.dll => 0x583e844f => 86
	i32 1493001747, ; 74: hi/Microsoft.Maui.Controls.resources.dll => 0x58fd6613 => 10
	i32 1514721132, ; 75: el/Microsoft.Maui.Controls.resources.dll => 0x5a48cf6c => 5
	i32 1543031311, ; 76: System.Text.RegularExpressions.dll => 0x5bf8ca0f => 105
	i32 1551623176, ; 77: sk/Microsoft.Maui.Controls.resources.dll => 0x5c7be408 => 25
	i32 1622152042, ; 78: Xamarin.AndroidX.Loader.dll => 0x60b0136a => 63
	i32 1624863272, ; 79: Xamarin.AndroidX.ViewPager2 => 0x60d97228 => 73
	i32 1636350590, ; 80: Xamarin.AndroidX.CursorAdapter => 0x6188ba7e => 55
	i32 1639515021, ; 81: System.Net.Http.dll => 0x61b9038d => 92
	i32 1639986890, ; 82: System.Text.RegularExpressions => 0x61c036ca => 105
	i32 1657153582, ; 83: System.Runtime => 0x62c6282e => 101
	i32 1658251792, ; 84: Xamarin.Google.Android.Material.dll => 0x62d6ea10 => 74
	i32 1677501392, ; 85: System.Net.Primitives.dll => 0x63fca3d0 => 93
	i32 1679769178, ; 86: System.Security.Cryptography => 0x641f3e5a => 102
	i32 1729485958, ; 87: Xamarin.AndroidX.CardView.dll => 0x6715dc86 => 51
	i32 1736233607, ; 88: ro/Microsoft.Maui.Controls.resources.dll => 0x677cd287 => 23
	i32 1743415430, ; 89: ca\Microsoft.Maui.Controls.resources => 0x67ea6886 => 1
	i32 1766324549, ; 90: Xamarin.AndroidX.SwipeRefreshLayout => 0x6947f945 => 71
	i32 1770582343, ; 91: Microsoft.Extensions.Logging.dll => 0x6988f147 => 39
	i32 1780572499, ; 92: Mono.Android.Runtime.dll => 0x6a216153 => 112
	i32 1782862114, ; 93: ms\Microsoft.Maui.Controls.resources => 0x6a445122 => 17
	i32 1788241197, ; 94: Xamarin.AndroidX.Fragment => 0x6a96652d => 58
	i32 1793755602, ; 95: he\Microsoft.Maui.Controls.resources => 0x6aea89d2 => 9
	i32 1808609942, ; 96: Xamarin.AndroidX.Loader => 0x6bcd3296 => 63
	i32 1813058853, ; 97: Xamarin.Kotlin.StdLib.dll => 0x6c111525 => 75
	i32 1813201214, ; 98: Xamarin.Google.Android.Material => 0x6c13413e => 74
	i32 1818569960, ; 99: Xamarin.AndroidX.Navigation.UI.dll => 0x6c652ce8 => 67
	i32 1828688058, ; 100: Microsoft.Extensions.Logging.Abstractions.dll => 0x6cff90ba => 40
	i32 1842015223, ; 101: uk/Microsoft.Maui.Controls.resources.dll => 0x6dcaebf7 => 29
	i32 1853025655, ; 102: sv\Microsoft.Maui.Controls.resources => 0x6e72ed77 => 26
	i32 1858542181, ; 103: System.Linq.Expressions => 0x6ec71a65 => 88
	i32 1875935024, ; 104: fr\Microsoft.Maui.Controls.resources => 0x6fd07f30 => 8
	i32 1910275211, ; 105: System.Collections.NonGeneric.dll => 0x71dc7c8b => 79
	i32 1961813231, ; 106: Xamarin.AndroidX.Security.SecurityCrypto.dll => 0x74eee4ef => 70
	i32 1968388702, ; 107: Microsoft.Extensions.Configuration.dll => 0x75533a5e => 35
	i32 2003115576, ; 108: el\Microsoft.Maui.Controls.resources => 0x77651e38 => 5
	i32 2019465201, ; 109: Xamarin.AndroidX.Lifecycle.ViewModel => 0x785e97f1 => 61
	i32 2025202353, ; 110: ar/Microsoft.Maui.Controls.resources.dll => 0x78b622b1 => 0
	i32 2045470958, ; 111: System.Private.Xml => 0x79eb68ee => 98
	i32 2055257422, ; 112: Xamarin.AndroidX.Lifecycle.LiveData.Core.dll => 0x7a80bd4e => 60
	i32 2066184531, ; 113: de\Microsoft.Maui.Controls.resources => 0x7b277953 => 4
	i32 2079903147, ; 114: System.Runtime.dll => 0x7bf8cdab => 101
	i32 2090596640, ; 115: System.Numerics.Vectors => 0x7c9bf920 => 95
	i32 2127167465, ; 116: System.Console => 0x7ec9ffe9 => 84
	i32 2159891885, ; 117: Microsoft.Maui => 0x80bd55ad => 45
	i32 2169148018, ; 118: hu\Microsoft.Maui.Controls.resources => 0x814a9272 => 12
	i32 2181898931, ; 119: Microsoft.Extensions.Options.dll => 0x820d22b3 => 41
	i32 2192057212, ; 120: Microsoft.Extensions.Logging.Abstractions => 0x82a8237c => 40
	i32 2193016926, ; 121: System.ObjectModel.dll => 0x82b6c85e => 96
	i32 2201107256, ; 122: Xamarin.KotlinX.Coroutines.Core.Jvm.dll => 0x83323b38 => 76
	i32 2201231467, ; 123: System.Net.Http => 0x8334206b => 92
	i32 2207618523, ; 124: it\Microsoft.Maui.Controls.resources => 0x839595db => 14
	i32 2266799131, ; 125: Microsoft.Extensions.Configuration.Abstractions => 0x871c9c1b => 36
	i32 2270573516, ; 126: fr/Microsoft.Maui.Controls.resources.dll => 0x875633cc => 8
	i32 2279755925, ; 127: Xamarin.AndroidX.RecyclerView.dll => 0x87e25095 => 68
	i32 2303942373, ; 128: nb\Microsoft.Maui.Controls.resources => 0x89535ee5 => 18
	i32 2305521784, ; 129: System.Private.CoreLib.dll => 0x896b7878 => 110
	i32 2353062107, ; 130: System.Net.Primitives => 0x8c40e0db => 93
	i32 2368005991, ; 131: System.Xml.ReaderWriter.dll => 0x8d24e767 => 108
	i32 2371007202, ; 132: Microsoft.Extensions.Configuration => 0x8d52b2e2 => 35
	i32 2395872292, ; 133: id\Microsoft.Maui.Controls.resources => 0x8ece1c24 => 13
	i32 2427813419, ; 134: hi\Microsoft.Maui.Controls.resources => 0x90b57e2b => 10
	i32 2435356389, ; 135: System.Console.dll => 0x912896e5 => 84
	i32 2475788418, ; 136: Java.Interop.dll => 0x93918882 => 111
	i32 2480646305, ; 137: Microsoft.Maui.Controls => 0x93dba8a1 => 43
	i32 2550873716, ; 138: hr\Microsoft.Maui.Controls.resources => 0x980b3e74 => 11
	i32 2570120770, ; 139: System.Text.Encodings.Web => 0x9930ee42 => 103
	i32 2593496499, ; 140: pl\Microsoft.Maui.Controls.resources => 0x9a959db3 => 20
	i32 2605712449, ; 141: Xamarin.KotlinX.Coroutines.Core.Jvm => 0x9b500441 => 76
	i32 2617129537, ; 142: System.Private.Xml.dll => 0x9bfe3a41 => 98
	i32 2620871830, ; 143: Xamarin.AndroidX.CursorAdapter.dll => 0x9c375496 => 55
	i32 2626831493, ; 144: ja\Microsoft.Maui.Controls.resources => 0x9c924485 => 15
	i32 2663698177, ; 145: System.Runtime.Loader => 0x9ec4cf01 => 100
	i32 2732626843, ; 146: Xamarin.AndroidX.Activity => 0xa2e0939b => 48
	i32 2737747696, ; 147: Xamarin.AndroidX.AppCompat.AppCompatResources.dll => 0xa32eb6f0 => 50
	i32 2752995522, ; 148: pt-BR\Microsoft.Maui.Controls.resources => 0xa41760c2 => 21
	i32 2758225723, ; 149: Microsoft.Maui.Controls.Xaml => 0xa4672f3b => 44
	i32 2764765095, ; 150: Microsoft.Maui.dll => 0xa4caf7a7 => 45
	i32 2778768386, ; 151: Xamarin.AndroidX.ViewPager.dll => 0xa5a0a402 => 72
	i32 2785988530, ; 152: th\Microsoft.Maui.Controls.resources => 0xa60ecfb2 => 27
	i32 2801831435, ; 153: Microsoft.Maui.Graphics => 0xa7008e0b => 47
	i32 2806116107, ; 154: es/Microsoft.Maui.Controls.resources.dll => 0xa741ef0b => 6
	i32 2810250172, ; 155: Xamarin.AndroidX.CoordinatorLayout.dll => 0xa78103bc => 53
	i32 2831556043, ; 156: nl/Microsoft.Maui.Controls.resources.dll => 0xa8c61dcb => 19
	i32 2853208004, ; 157: Xamarin.AndroidX.ViewPager => 0xaa107fc4 => 72
	i32 2861189240, ; 158: Microsoft.Maui.Essentials => 0xaa8a4878 => 46
	i32 2909740682, ; 159: System.Private.CoreLib => 0xad6f1e8a => 110
	i32 2916838712, ; 160: Xamarin.AndroidX.ViewPager2.dll => 0xaddb6d38 => 73
	i32 2919462931, ; 161: System.Numerics.Vectors.dll => 0xae037813 => 95
	i32 2959614098, ; 162: System.ComponentModel.dll => 0xb0682092 => 83
	i32 2978675010, ; 163: Xamarin.AndroidX.DrawerLayout => 0xb18af942 => 57
	i32 2987532451, ; 164: Xamarin.AndroidX.Security.SecurityCrypto => 0xb21220a3 => 70
	i32 3038032645, ; 165: _Microsoft.Android.Resource.Designer.dll => 0xb514b305 => 34
	i32 3057625584, ; 166: Xamarin.AndroidX.Navigation.Common => 0xb63fa9f0 => 64
	i32 3059408633, ; 167: Mono.Android.Runtime => 0xb65adef9 => 112
	i32 3059793426, ; 168: System.ComponentModel.Primitives => 0xb660be12 => 81
	i32 3077302341, ; 169: hu/Microsoft.Maui.Controls.resources.dll => 0xb76be845 => 12
	i32 3178803400, ; 170: Xamarin.AndroidX.Navigation.Fragment.dll => 0xbd78b0c8 => 65
	i32 3220365878, ; 171: System.Threading => 0xbff2e236 => 107
	i32 3258312781, ; 172: Xamarin.AndroidX.CardView => 0xc235e84d => 51
	i32 3305363605, ; 173: fi\Microsoft.Maui.Controls.resources => 0xc503d895 => 7
	i32 3316684772, ; 174: System.Net.Requests.dll => 0xc5b097e4 => 94
	i32 3317135071, ; 175: Xamarin.AndroidX.CustomView.dll => 0xc5b776df => 56
	i32 3346324047, ; 176: Xamarin.AndroidX.Navigation.Runtime => 0xc774da4f => 66
	i32 3357674450, ; 177: ru\Microsoft.Maui.Controls.resources => 0xc8220bd2 => 24
	i32 3358260929, ; 178: System.Text.Json => 0xc82afec1 => 104
	i32 3362522851, ; 179: Xamarin.AndroidX.Core => 0xc86c06e3 => 54
	i32 3366347497, ; 180: Java.Interop => 0xc8a662e9 => 111
	i32 3374999561, ; 181: Xamarin.AndroidX.RecyclerView => 0xc92a6809 => 68
	i32 3381016424, ; 182: da\Microsoft.Maui.Controls.resources => 0xc9863768 => 3
	i32 3428513518, ; 183: Microsoft.Extensions.DependencyInjection.dll => 0xcc5af6ee => 37
	i32 3463511458, ; 184: hr/Microsoft.Maui.Controls.resources.dll => 0xce70fda2 => 11
	i32 3471940407, ; 185: System.ComponentModel.TypeConverter.dll => 0xcef19b37 => 82
	i32 3476120550, ; 186: Mono.Android => 0xcf3163e6 => 113
	i32 3479583265, ; 187: ru/Microsoft.Maui.Controls.resources.dll => 0xcf663a21 => 24
	i32 3484440000, ; 188: ro\Microsoft.Maui.Controls.resources => 0xcfb055c0 => 23
	i32 3485117614, ; 189: System.Text.Json.dll => 0xcfbaacae => 104
	i32 3580758918, ; 190: zh-HK\Microsoft.Maui.Controls.resources => 0xd56e0b86 => 31
	i32 3587742139, ; 191: YabosenStatus.dll => 0xd5d899bb => 77
	i32 3608519521, ; 192: System.Linq.dll => 0xd715a361 => 89
	i32 3641597786, ; 193: Xamarin.AndroidX.Lifecycle.LiveData.Core => 0xd90e5f5a => 60
	i32 3643446276, ; 194: tr\Microsoft.Maui.Controls.resources => 0xd92a9404 => 28
	i32 3643854240, ; 195: Xamarin.AndroidX.Navigation.Fragment => 0xd930cda0 => 65
	i32 3657292374, ; 196: Microsoft.Extensions.Configuration.Abstractions.dll => 0xd9fdda56 => 36
	i32 3672681054, ; 197: Mono.Android.dll => 0xdae8aa5e => 113
	i32 3697841164, ; 198: zh-Hant/Microsoft.Maui.Controls.resources.dll => 0xdc68940c => 33
	i32 3724971120, ; 199: Xamarin.AndroidX.Navigation.Common.dll => 0xde068c70 => 64
	i32 3737834244, ; 200: System.Net.Http.Json.dll => 0xdecad304 => 91
	i32 3748608112, ; 201: System.Diagnostics.DiagnosticSource => 0xdf6f3870 => 85
	i32 3786282454, ; 202: Xamarin.AndroidX.Collection => 0xe1ae15d6 => 52
	i32 3792276235, ; 203: System.Collections.NonGeneric => 0xe2098b0b => 79
	i32 3823082795, ; 204: System.Security.Cryptography.dll => 0xe3df9d2b => 102
	i32 3841636137, ; 205: Microsoft.Extensions.DependencyInjection.Abstractions.dll => 0xe4fab729 => 38
	i32 3849253459, ; 206: System.Runtime.InteropServices.dll => 0xe56ef253 => 99
	i32 3889960447, ; 207: zh-Hans/Microsoft.Maui.Controls.resources.dll => 0xe7dc15ff => 32
	i32 3896106733, ; 208: System.Collections.Concurrent.dll => 0xe839deed => 78
	i32 3896760992, ; 209: Xamarin.AndroidX.Core.dll => 0xe843daa0 => 54
	i32 3928044579, ; 210: System.Xml.ReaderWriter => 0xea213423 => 108
	i32 3931092270, ; 211: Xamarin.AndroidX.Navigation.UI => 0xea4fb52e => 67
	i32 3955647286, ; 212: Xamarin.AndroidX.AppCompat.dll => 0xebc66336 => 49
	i32 3980434154, ; 213: th/Microsoft.Maui.Controls.resources.dll => 0xed409aea => 27
	i32 3987592930, ; 214: he/Microsoft.Maui.Controls.resources.dll => 0xedadd6e2 => 9
	i32 4025784931, ; 215: System.Memory => 0xeff49a63 => 90
	i32 4046471985, ; 216: Microsoft.Maui.Controls.Xaml.dll => 0xf1304331 => 44
	i32 4073602200, ; 217: System.Threading.dll => 0xf2ce3c98 => 107
	i32 4094352644, ; 218: Microsoft.Maui.Essentials.dll => 0xf40add04 => 46
	i32 4100113165, ; 219: System.Private.Uri => 0xf462c30d => 97
	i32 4102112229, ; 220: pt/Microsoft.Maui.Controls.resources.dll => 0xf48143e5 => 22
	i32 4125707920, ; 221: ms/Microsoft.Maui.Controls.resources.dll => 0xf5e94e90 => 17
	i32 4126470640, ; 222: Microsoft.Extensions.DependencyInjection => 0xf5f4f1f0 => 37
	i32 4150914736, ; 223: uk\Microsoft.Maui.Controls.resources => 0xf769eeb0 => 29
	i32 4182413190, ; 224: Xamarin.AndroidX.Lifecycle.ViewModelSavedState.dll => 0xf94a8f86 => 62
	i32 4213026141, ; 225: System.Diagnostics.DiagnosticSource.dll => 0xfb1dad5d => 85
	i32 4271975918, ; 226: Microsoft.Maui.Controls.dll => 0xfea12dee => 43
	i32 4292120959 ; 227: Xamarin.AndroidX.Lifecycle.ViewModelSavedState => 0xffd4917f => 62
], align 4

@assembly_image_cache_indices = dso_local local_unnamed_addr constant [228 x i32] [
	i32 106, ; 0
	i32 33, ; 1
	i32 47, ; 2
	i32 99, ; 3
	i32 52, ; 4
	i32 71, ; 5
	i32 30, ; 6
	i32 31, ; 7
	i32 83, ; 8
	i32 2, ; 9
	i32 30, ; 10
	i32 48, ; 11
	i32 15, ; 12
	i32 59, ; 13
	i32 14, ; 14
	i32 106, ; 15
	i32 90, ; 16
	i32 34, ; 17
	i32 26, ; 18
	i32 80, ; 19
	i32 58, ; 20
	i32 109, ; 21
	i32 96, ; 22
	i32 13, ; 23
	i32 7, ; 24
	i32 42, ; 25
	i32 39, ; 26
	i32 21, ; 27
	i32 56, ; 28
	i32 19, ; 29
	i32 103, ; 30
	i32 78, ; 31
	i32 1, ; 32
	i32 16, ; 33
	i32 4, ; 34
	i32 100, ; 35
	i32 94, ; 36
	i32 87, ; 37
	i32 25, ; 38
	i32 41, ; 39
	i32 97, ; 40
	i32 86, ; 41
	i32 91, ; 42
	i32 81, ; 43
	i32 28, ; 44
	i32 59, ; 45
	i32 80, ; 46
	i32 69, ; 47
	i32 38, ; 48
	i32 3, ; 49
	i32 49, ; 50
	i32 88, ; 51
	i32 61, ; 52
	i32 82, ; 53
	i32 75, ; 54
	i32 109, ; 55
	i32 16, ; 56
	i32 22, ; 57
	i32 66, ; 58
	i32 20, ; 59
	i32 18, ; 60
	i32 2, ; 61
	i32 57, ; 62
	i32 77, ; 63
	i32 89, ; 64
	i32 32, ; 65
	i32 69, ; 66
	i32 53, ; 67
	i32 0, ; 68
	i32 6, ; 69
	i32 87, ; 70
	i32 50, ; 71
	i32 42, ; 72
	i32 86, ; 73
	i32 10, ; 74
	i32 5, ; 75
	i32 105, ; 76
	i32 25, ; 77
	i32 63, ; 78
	i32 73, ; 79
	i32 55, ; 80
	i32 92, ; 81
	i32 105, ; 82
	i32 101, ; 83
	i32 74, ; 84
	i32 93, ; 85
	i32 102, ; 86
	i32 51, ; 87
	i32 23, ; 88
	i32 1, ; 89
	i32 71, ; 90
	i32 39, ; 91
	i32 112, ; 92
	i32 17, ; 93
	i32 58, ; 94
	i32 9, ; 95
	i32 63, ; 96
	i32 75, ; 97
	i32 74, ; 98
	i32 67, ; 99
	i32 40, ; 100
	i32 29, ; 101
	i32 26, ; 102
	i32 88, ; 103
	i32 8, ; 104
	i32 79, ; 105
	i32 70, ; 106
	i32 35, ; 107
	i32 5, ; 108
	i32 61, ; 109
	i32 0, ; 110
	i32 98, ; 111
	i32 60, ; 112
	i32 4, ; 113
	i32 101, ; 114
	i32 95, ; 115
	i32 84, ; 116
	i32 45, ; 117
	i32 12, ; 118
	i32 41, ; 119
	i32 40, ; 120
	i32 96, ; 121
	i32 76, ; 122
	i32 92, ; 123
	i32 14, ; 124
	i32 36, ; 125
	i32 8, ; 126
	i32 68, ; 127
	i32 18, ; 128
	i32 110, ; 129
	i32 93, ; 130
	i32 108, ; 131
	i32 35, ; 132
	i32 13, ; 133
	i32 10, ; 134
	i32 84, ; 135
	i32 111, ; 136
	i32 43, ; 137
	i32 11, ; 138
	i32 103, ; 139
	i32 20, ; 140
	i32 76, ; 141
	i32 98, ; 142
	i32 55, ; 143
	i32 15, ; 144
	i32 100, ; 145
	i32 48, ; 146
	i32 50, ; 147
	i32 21, ; 148
	i32 44, ; 149
	i32 45, ; 150
	i32 72, ; 151
	i32 27, ; 152
	i32 47, ; 153
	i32 6, ; 154
	i32 53, ; 155
	i32 19, ; 156
	i32 72, ; 157
	i32 46, ; 158
	i32 110, ; 159
	i32 73, ; 160
	i32 95, ; 161
	i32 83, ; 162
	i32 57, ; 163
	i32 70, ; 164
	i32 34, ; 165
	i32 64, ; 166
	i32 112, ; 167
	i32 81, ; 168
	i32 12, ; 169
	i32 65, ; 170
	i32 107, ; 171
	i32 51, ; 172
	i32 7, ; 173
	i32 94, ; 174
	i32 56, ; 175
	i32 66, ; 176
	i32 24, ; 177
	i32 104, ; 178
	i32 54, ; 179
	i32 111, ; 180
	i32 68, ; 181
	i32 3, ; 182
	i32 37, ; 183
	i32 11, ; 184
	i32 82, ; 185
	i32 113, ; 186
	i32 24, ; 187
	i32 23, ; 188
	i32 104, ; 189
	i32 31, ; 190
	i32 77, ; 191
	i32 89, ; 192
	i32 60, ; 193
	i32 28, ; 194
	i32 65, ; 195
	i32 36, ; 196
	i32 113, ; 197
	i32 33, ; 198
	i32 64, ; 199
	i32 91, ; 200
	i32 85, ; 201
	i32 52, ; 202
	i32 79, ; 203
	i32 102, ; 204
	i32 38, ; 205
	i32 99, ; 206
	i32 32, ; 207
	i32 78, ; 208
	i32 54, ; 209
	i32 108, ; 210
	i32 67, ; 211
	i32 49, ; 212
	i32 27, ; 213
	i32 9, ; 214
	i32 90, ; 215
	i32 44, ; 216
	i32 107, ; 217
	i32 46, ; 218
	i32 97, ; 219
	i32 22, ; 220
	i32 17, ; 221
	i32 37, ; 222
	i32 29, ; 223
	i32 62, ; 224
	i32 85, ; 225
	i32 43, ; 226
	i32 62 ; 227
], align 4

@marshal_methods_number_of_classes = dso_local local_unnamed_addr constant i32 0, align 4

@marshal_methods_class_cache = dso_local local_unnamed_addr global [0 x %struct.MarshalMethodsManagedClass] zeroinitializer, align 4

; Names of classes in which marshal methods reside
@mm_class_names = dso_local local_unnamed_addr constant [0 x ptr] zeroinitializer, align 4

@mm_method_names = dso_local local_unnamed_addr constant [1 x %struct.MarshalMethodName] [
	%struct.MarshalMethodName {
		i64 0, ; id 0x0; name: 
		ptr @.MarshalMethodName.0_name; char* name
	} ; 0
], align 8

; get_function_pointer (uint32_t mono_image_index, uint32_t class_index, uint32_t method_token, void*& target_ptr)
@get_function_pointer = internal dso_local unnamed_addr global ptr null, align 4

; Functions

; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" nofree norecurse nosync nounwind "stack-protector-buffer-size"="8" uwtable willreturn
define void @xamarin_app_init(ptr nocapture noundef readnone %env, ptr noundef %fn) local_unnamed_addr #0
{
	%fnIsNull = icmp eq ptr %fn, null
	br i1 %fnIsNull, label %1, label %2

1: ; preds = %0
	%putsResult = call noundef i32 @puts(ptr @.str.0)
	call void @abort()
	unreachable 

2: ; preds = %1, %0
	store ptr %fn, ptr @get_function_pointer, align 4, !tbaa !3
	ret void
}

; Strings
@.str.0 = private unnamed_addr constant [40 x i8] c"get_function_pointer MUST be specified\0A\00", align 1

;MarshalMethodName
@.MarshalMethodName.0_name = private unnamed_addr constant [1 x i8] c"\00", align 1

; External functions

; Function attributes: "no-trapping-math"="true" noreturn nounwind "stack-protector-buffer-size"="8"
declare void @abort() local_unnamed_addr #2

; Function attributes: nofree nounwind
declare noundef i32 @puts(ptr noundef) local_unnamed_addr #1
attributes #0 = { "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" nofree norecurse nosync nounwind "stack-protector-buffer-size"="8" "stackrealign" "target-cpu"="i686" "target-features"="+cx8,+mmx,+sse,+sse2,+sse3,+ssse3,+x87" "tune-cpu"="generic" uwtable willreturn }
attributes #1 = { nofree nounwind }
attributes #2 = { "no-trapping-math"="true" noreturn nounwind "stack-protector-buffer-size"="8" "stackrealign" "target-cpu"="i686" "target-features"="+cx8,+mmx,+sse,+sse2,+sse3,+ssse3,+x87" "tune-cpu"="generic" }

; Metadata
!llvm.module.flags = !{!0, !1, !7}
!0 = !{i32 1, !"wchar_size", i32 4}
!1 = !{i32 7, !"PIC Level", i32 2}
!llvm.ident = !{!2}
!2 = !{!"Xamarin.Android remotes/origin/release/8.0.4xx @ 82d8938cf80f6d5fa6c28529ddfbdb753d805ab4"}
!3 = !{!4, !4, i64 0}
!4 = !{!"any pointer", !5, i64 0}
!5 = !{!"omnipotent char", !6, i64 0}
!6 = !{!"Simple C++ TBAA"}
!7 = !{i32 1, !"NumRegisterParameters", i32 0}
