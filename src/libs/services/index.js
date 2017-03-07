import { getImageService, updateImageService, clinicalPhotoService } from './image';
import { mrnScanerService } from './mrn-scaner';
import { patientsService,
         patientImagesService,
         createPatientService,
         updatePatientService,
       } from './patients';


export default {
    getImageService,
    updateImageService,
    mrnScanerService,
    clinicalPhotoService,
    patientsService,
    patientImagesService,
    createPatientService,
    updatePatientService,
}
