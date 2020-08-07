export function findRearCamera(devices: MediaDeviceInfo[]): string {
  if (!devices || !devices.length) {
    return '';
  }

  // check for keywords
  const found = devices
    .find(camera => camera.label.search(/(rear|back)/i) !== -1);
  if (found) {
    return found.deviceId;
  }

  // return the last camera by default
  return devices[devices.length - 1].deviceId;
}

export function cutOffUrl(code: string): string {
  const codeIndex = code.lastIndexOf('/');

  if (codeIndex !== -1) {
    return code.substr(codeIndex + 1);
  }
  return code;
}
