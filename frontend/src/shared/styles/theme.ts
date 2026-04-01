export const theme = {
  token: {
    colorPrimary: '#2563eb'
  },

  components: {
    Button: {
      colorPrimary: '#0f172a',
      colorBgContainerDisabled: 'rgba(37,99,235,0.35)',
      colorTextDisabled: '#ffffff'
    },
    Form: {
      colorPrimary: '#0f172a'
    },
    Input: {
      activeBorderColor: '#2563eb',
      hoverBorderColor: '#2563eb',
      activeShadow: '0 0 0 2px rgba(37,99,235,0.12)',
      colorPrimary: '#2563eb'
    },
    Select: {
      activeBorderColor: '#2563eb',
      hoverBorderColor: '#2563eb',
      activeShadow: '0 0 0 2px rgba(37,99,235,0.12)',
      colorPrimary: '#2563eb'
    },
    Table: {
      colorPrimary: '#0f172a',
      colorText: '#0f172a',
      colorBgContainer: '#ffffff',
      headerBg: '#e2e8f0',
      borderColor: '#ffffff',
      headerBorderRadius: 0
    },
    Pagination: {
      colorPrimary: '#e2e8f0',
      itemActiveBg: '#0f172a'
    }
  }
}

// export const theme = {
//   token: {
//     colorPrimary: '#739900',
//     colorInfo: '#9d16ff',
//
//     grayColor: '#e2e3e4',
//     lightGrayColor: '#F3F4F5',
//     fontFamily: 'Inter',
//
//     // Цвета для типографии
//     colorTextBase: '#18181B', // Цвет по умолчанию
//     colorTextSecondary: '#71717A',
//
//     // Типографика
//     fontSizeSM: 14,
//     fontSizeMD: 16,
//     fontSizeLG: 24,
//     fontSizeXL: 30,
//     fontSizeXXL: 36,
//
//     lineHeightSM: 22,
//     lineHeightMD: 24,
//     lineHeightLG: 32,
//     lineHeightXL: 36,
//     lineHeightXXL: 40,
//
//     fontWeightNormal: 400,
//     fontWeightBold: 700,
//
//     letterSpacingSM: '1.25%',
//     letterSpacingMD: '-0.5%',
//     letterSpacingLG: '-1.5%',
//     letterSpacingXL: '0%',
//     letterSpacingXXL: '0%',
//
//     // Цвета
//     'green-10': '#D4FF53',
//     'green-20': '#171F00',
//     'green-30': '#263300',
//     'green-40': '#2E3D00',
//     'green-50': '#486000',
//     'green-60': '#6B8F00',
//     'green-70': '#739900',
//     'green-80': '#7AA300',
//     'green-90': '#82AD00',
//     'green-100': '#8AB800',
//     'green-110': '#C9FF29',
//     'green-120': '#DCFF74',
//     'green-130': '#E3FF8F',
//     'green-140': '#F0FFC2',
//     'green-150': '#F5FFD6',
//     'green-160': '#FAFFEB'
//   },
//
//   components: {
//     Button: {
//       defaultShadow: 0,
//       primaryShadow: 0,
//
//       onlyIconSizeSM: 16,
//       onlyIconSize: 20,
//       onlyIconSizeLG: 24,
//
//       controlHeight: 40,
//       paddingBlock: 12,
//       paddingInline: 16,
//       controlSpacing: 8,
//       borderRadius: 8,
//       fontSize: 14,
//       fontWeight: 400,
//       letterSpacing: -0.2,
//       border: 'none',
//       textAlign: 'center',
//
//       colorPrimary: '#739900',
//       colorPrimaryHover: '#B2ED00',
//       colorPrimaryActive: '#6B8F00',
//       colorPrimaryText: '#FFFFFF',
//
//       defaultBg: '#FFFFFF',
//       defaultColor: '#18181B',
//       defaultActiveColor: '#18181B',
//       defaultBorderColor: '#E4E4E7',
//       defaultHoverBorderColor: '#A1A1AA',
//       defaultHoverBg: '#F4F4F5',
//       defaultHoverColor: '#18181B',
//       defaultActiveBg: '#FFFFFF',
//       defaultActiveBorderColor: '#8C8C8C',
//
//       linkBg: 'transparent',
//       linkHoverBg: 'transparent',
//       linkActiveBg: 'transparent',
//       colorLink: '#739900',
//       colorLinkHover: '#B2ED00',
//       colorLinkActive: '#B2ED00',
//       linkHoverDecoration: 'underline',
//       linkFocusDecoration: 'none',
//       linkActiveDecoration: 'none',
//
//       controlHeightSM: 32,
//       paddingBlockSM: 8,
//       paddingInlineSM: 12,
//       fontSizeSM: 14,
//
//       controlHeightLG: 44,
//       paddingBlockLG: 14,
//       paddingInlineLG: 20,
//       fontSizeLG: 14
//     },
//
//     Input: {
//       fontSize: 14,
//       borderRadius: 8,
//       controlHeight: 46,
//       colorErrorBorder: '#DC2626'
//     },
//
//     Segmented: {
//       trackBg: '#E4E4E7',
//       itemColor: '#71717A',
//       itemHoverColor: '#18181B',
//       itemSelectedColor: '#18181B',
//       itemSelectedBg: '#FFFFFF',
//       itemHoverBg: '#ffffff14',
//       trackPadding: '5px 6px',
//       trackRadius: '8px',
//       borderRadius: 7,
//       controlHeight: 35,
//       fontSize: 14,
//       fontWeight: 400,
//       lineHeight: 24
//     },
//
//     Select: {
//       optionFontSize: 14,
//       fontSize: 14,
//       activeOutlineColor: 'transparent',
//       width: 90,
//       style: {
//         width: 90
//       }
//     },
//
//     Breadcrumb: {
//       linkColor: '#18181B',
//       itemColor: '#18181B',
//       separatorColor: '#71717A',
//       linkHoverColor: '#39393e',
//       colorBgTextHover: 'transparent',
//       fontSize: '14px',
//       separatorMargin: 8
//     },
//
//     Typography: {
//       fontSize: 14, // базовый размер шрифта
//       fontSizeHeading1: 40,
//       fontSizeHeading2: 36,
//       fontSizeHeading3: 30,
//       fontSizeHeading4: 26,
//       fontSizeHeading5: 24,
//       fontSizeHeading6: 20,
//       lineHeightHeading1: 1.3,
//       lineHeightHeading2: 1.3,
//       lineHeightHeading3: 1.3,
//       lineHeightHeading4: 1.3,
//       lineHeightHeading5: 1.3,
//       lineHeightHeading6: 1.3,
//       colorTextHeading: '#18181B',
//       titleMarginTop: 0,
//       titleMarginBottom: 20
//     }
//   }
// }
