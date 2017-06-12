import { getImageService, updateImageService, clinicalPhotoService } from './image';
import { mrnScanerService } from './mrn-scaner';
import { updateDoctorService } from './doctor';
import { getPatientMolesService, addMoleService, getMoleService } from './mole';
import { addAnatomicalSitePhotoService, getAnatomicalSitesService } from './anatomical-site.js';
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
    getPatientMolesService,
    addMoleService,
    getMoleService,
    addAnatomicalSitePhotoService,
    getAnatomicalSitesService,
    clinicalPhotoService,
    patientsService,
    patientImagesService,
    createPatientService,
    updatePatientService,
};
