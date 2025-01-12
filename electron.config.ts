export default {
  packagerConfig: {
    asar: true,
    icon: './public/Icons/icon_spreadsheet-solid'
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: './public/Icons/icon_spreadsheet-solid.svg',
        setupIcon: './public/Icons/icon_spreadsheet-solid.svg'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    }
  ],
} 