import { mrnScanerService } from './mrn-scaner';
import { updateDoctorService,
         getDoctorService } from './doctor';
import { getPatientMolesService,
         addMoleService,
         getMoleService,
         updateMoleService,
       } from './mole';
import { addMolePhotoService,
         getMolePhotoService,
         updateMolePhotoService,
       } from './photo';
import { addAnatomicalSitePhotoService, getAnatomicalSitesService } from './anatomical-site.js';
import { patientsService,
         getPatientService,
         createPatientService,
         updatePatientService,
         updatePatientConsentService,
       } from './patients';
import { getSiteJoinRequestsService,
         createSiteJoinRequestService,
         confirmSiteJoinRequestService,
       } from './site-join-requests';
import { getStudiesService,
         getInvitesService,
       } from './study';


export default {
    mrnScanerService,
    updateDoctorService,
    getDoctorService,
    getPatientMolesService,
    addMoleService,
    getMoleService,
    updateMoleService,
    addMolePhotoService,
    getMolePhotoService,
    updateMolePhotoService,
    addAnatomicalSitePhotoService,
    getAnatomicalSitesService,
    patientsService,
    getPatientService,
    createPatientService,
    updatePatientService,
    updatePatientConsentService,
    getSiteJoinRequestsService,
    createSiteJoinRequestService,
    confirmSiteJoinRequestService,
    getStudiesService,
    getInvitesService,
};
