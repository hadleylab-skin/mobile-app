import { getImageService, updateImageService, clinicalPhotoService } from './image';
import { mrnScanerService } from './mrn-scaner';
import { updateDoctorService } from './doctor';
import { getMolesService, addMoleService } from './mole';
import { patientsService,
         patientImagesService,
         createPatientService,
         updatePatientService,
       } from './patients';


export default {
    getImageService,
    updateImageService,
    mrnScanerService,
    updateDoctorService,
    getMolesService,
    addMoleService,
    clinicalPhotoService,
    patientsService,
    patientImagesService,
    createPatientService,
    updatePatientService,
};
