# This file is only intended for development purposes
from kubeflow.kubeflow.cd import base_runner

base_runner.main(component_name="notebook-server-rstudio",
                 workflow_name="nb-rstudio-build")
