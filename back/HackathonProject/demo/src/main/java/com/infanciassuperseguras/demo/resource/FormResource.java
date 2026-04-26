package com.infanciassuperseguras.demo.resource;

import com.infanciassuperseguras.demo.entity.Form;
import com.infanciassuperseguras.demo.entity.Question;
import com.infanciassuperseguras.demo.repository.FormRepository;
import com.infanciassuperseguras.demo.repository.QuestionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
@Path("/forms")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Forms", description = "Plantillas de formularios de reporte (banco de preguntas).")
public class FormResource {

    private final FormRepository formRepository;
    private final QuestionRepository questionRepository;

    public FormResource(FormRepository formRepository, QuestionRepository questionRepository) {
        this.formRepository = formRepository;
        this.questionRepository = questionRepository;
    }

    @GET
    @Operation(summary = "Lista todos los formularios disponibles")
    public List<Form> list() {
        return formRepository.findAllWithQuestions();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Obtiene un formulario por id, incluyendo sus preguntas")
    public Response get(@PathParam("id") Long id) {
        return formRepository.findByIdWithQuestions(id)
                .map(f -> Response.ok(f).build())
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @POST
    @Operation(summary = "Crea un nuevo formulario")
    public Response create(Form form) {
        if (form.getQuestions() != null) {
            int idx = 0;
            for (Question q : form.getQuestions()) {
                q.setForm(form);
                q.setOrderIndex(idx++);
            }
        }
        Form saved = formRepository.save(form);
        return Response.status(Response.Status.CREATED).entity(saved).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Actualiza la descripción / target de un formulario")
    public Response update(@PathParam("id") Long id, Form body) {
        return formRepository.findById(id)
                .map(existing -> {
                    if (body.getDescription() != null) existing.setDescription(body.getDescription());
                    if (body.getTargetType() != null) existing.setTargetType(body.getTargetType());
                    if (body.getTargetValue() != null) existing.setTargetValue(body.getTargetValue());
                    return Response.ok(formRepository.save(existing)).build();
                })
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Elimina un formulario")
    public Response delete(@PathParam("id") Long id) {
        if (!formRepository.existsById(id)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        formRepository.deleteById(id);
        return Response.noContent().build();
    }

    @POST
    @Path("/{id}/questions")
    @Transactional
    @Operation(summary = "Agrega una pregunta a un formulario")
    public Response addQuestion(@PathParam("id") Long id, Question body) {
        return formRepository.findByIdWithQuestions(id)
                .map(form -> {
                    int nextIndex = form.getQuestions().stream()
                            .map(Question::getOrderIndex)
                            .max(Comparator.naturalOrder())
                            .map(i -> i + 1)
                            .orElse(0);
                    body.setForm(form);
                    body.setOrderIndex(nextIndex);
                    Question saved = questionRepository.save(body);
                    return Response.status(Response.Status.CREATED).entity(saved).build();
                })
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @DELETE
    @Path("/{id}/questions/{qid}")
    @Transactional
    @Operation(summary = "Elimina una pregunta de un formulario")
    public Response deleteQuestion(@PathParam("id") Long id, @PathParam("qid") Long qid) {
        return questionRepository.findById(qid)
                .map(q -> {
                    if (q.getForm() == null || !q.getForm().getId().equals(id)) {
                        return Response.status(Response.Status.NOT_FOUND).build();
                    }
                    questionRepository.deleteById(qid);
                    return Response.noContent().build();
                })
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }
}
